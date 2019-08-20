// tslint:disable:no-conditional-assignment

import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { Container, inject, injectable, named } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';
import { SnapshotReceivedEventModel } from '@adastradev/data-ingestion-sdk';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader, { IQueryResult } from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';
import IntegrationConfigFactory from '../IntegrationConfigFactory';
import IConnectionPool from '../DataAccess/IConnectionPool';
import { IntegrationSystemType, IntegrationType, IQueryDefinition, IQueryMetadata  } from '../IIntegrationConfig';
import { mapLimit } from 'async';
import { TableNotFoundException } from '../TableNotFoundException';
import { SNS } from 'aws-sdk';
import IDDLHelper from '../DataAccess/IDDLHelper';
import * as stream from 'stream';
import { AuthManager } from '@adastradev/user-management-sdk';
import { config } from 'aws-sdk/global';

interface IManifest {
    files: string[];
    ingestStartTime: string;
    ingestEndTime?: string;
    ingestDuration?: string;
    integrationType: string;
    tenantId: string;
    tenantName: string;
    ingestionPath: string;
}

let STATEMENT_CONCURRENCY = 5;
if (process.env.CONCURRENT_CONNECTIONS) {
    STATEMENT_CONCURRENCY = Number(process.env.CONCURRENT_CONNECTIONS);
}
/**
 * Handles messages received to instruct the agent to being its ingestion process
 *
 * @export
 * @class SendDataHandler
 * @implements {IMessageHandler}
 */
@injectable()
export default class SendDataHandler implements IMessageHandler {

    private _logger: Logger;
    private _writer: IDataWriter;
    private _integrationConfigFactory: IntegrationConfigFactory;
    private _connectionPool: IConnectionPool;
    private _container: Container;
    private _snapshotReceivedArn: any;
    private _sns: SNS;
    private _bucketPath: string;
    private _tenantName: string;
    private _tenantId: string;
    private _authManager: AuthManager;

    constructor(
        @inject(TYPES.DataWriter) writer: IDataWriter,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.IntegrationConfigFactory) integrationConfigFactory: IntegrationConfigFactory,
        @inject(TYPES.ConnectionPool) connectionPool: IConnectionPool,
        @inject(TYPES.Container) container: Container,
        @inject(TYPES.SNS) sns: SNS,
        @inject(TYPES.SnapshotReceivedTopicArn) snapshotReceivedArn: string,
        @inject(TYPES.Bucket) bucketPath: string,
        @inject(TYPES.DDLHelper)
        @named(IntegrationSystemType.Oracle)
        private readonly _oracleDDLHelper: IDDLHelper,
        @inject(TYPES.TenantName) tenantName: string,
        @inject(TYPES.AuthManager) authManager: AuthManager) {

        this._writer = writer;
        this._logger = logger;
        this._integrationConfigFactory = integrationConfigFactory;
        this._connectionPool = connectionPool;
        this._container = container;
        this._sns = sns;
        this._snapshotReceivedArn = snapshotReceivedArn;
        this._bucketPath = bucketPath;
        this._tenantId = bucketPath.split('/')[1];
        this._tenantName = tenantName;
        this._authManager = authManager;
    }

    public async handle(message: SendDataMessage) {
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        await this._authManager.refreshCognitoCredentials();
        config.credentials = await this._authManager.getIamCredentials();

        const integrationType = IntegrationType[process.env.INTEGRATION_TYPE] || IntegrationType.Banner;
        const integrationConfig = await this._integrationConfigFactory.create(integrationType);

        if (integrationConfig.type === IntegrationType.NotImplemented) {
            throw new Error(`Ingest commands for '${integrationType}' integrations are not yet supported`);
        }

        const ingestStartTime = moment();
        const ingestStartTimeAsString = ingestStartTime.toISOString();

        const folderPath = integrationType + '-' + ingestStartTimeAsString;

        const manifest: IManifest = {
            files: [],
            ingestStartTime: ingestStartTimeAsString,
            integrationType,
            tenantName: this._tenantName,
            tenantId: this._tenantId,
            ingestionPath: folderPath
        };

        await this._connectionPool.open();

        const aggregateMetadata: IQueryMetadata[] = new Array<IQueryMetadata>();

        return new Promise<void>((resolve, reject) => {
            let completionDescription: string;
            const validTables = {};
            for (const tbl of integrationConfig.queries.map((q) => q.name)) {
                validTables[tbl] = tbl;
            }

            // This is a function that helps us manage backpressure while streaming data
            mapLimit(integrationConfig.queries, STATEMENT_CONCURRENCY,
                async (queryDefinition: IQueryDefinition, queryCallback: any) => { // iterator value callback
                    // This callback runs for each item in the first arg - integrationConfig.queries
                    let reader: IDataReader;
                    let itemMetadata: Readable;

                    try {

                        const startTime = Date.now();

                        // Run query and get results from source DB
                        reader = this._container.get<IDataReader>(TYPES.DataReader);
                        const queryResult: IQueryResult = await reader.read(queryDefinition);
                        itemMetadata = queryResult.metadata;

                        // Ingest this query's results to S3 ingestion bucket
                        const uploaded = await this._writer.ingest(queryResult.result, folderPath, queryDefinition.name);

                        // Calculate duration data
                        const endTime = Date.now();
                        const diff = moment.duration(endTime - startTime);
                        completionDescription = diff.humanize(false);
                        this._logger.info(
                            `Ingestion for '${queryDefinition.name}' ` +
                            `took ${completionDescription} (${diff.asMilliseconds()}ms)`
                        );

                        // Push the resulting filename to the manifest as an expected file
                        // for downstream processes
                        manifest.files.push(uploaded.fileName);

                    } catch (err) {
                        delete validTables[queryDefinition.name];
                        if (err instanceof TableNotFoundException) {
                            // ignore query statements that fail due to missing tables/views
                            this._logger.warn(`${err.message || ''} - queryStatement: ${err.queryStatement}`);
                            queryCallback(null, { name: queryDefinition.name, data: null});
                            return;
                        } else {
                            this._logger.error(err);
                            queryCallback(err);
                            return;
                        }
                    } finally {
                        if (reader) {
                            await reader.close();
                        }
                    }
                    queryCallback(null, { name: queryDefinition.name, data: itemMetadata });
                },
                async (err, results) => { // async.mapLimit callback
                    // This will run after the iterator function above has completed for each query
                    if (err) {
                        await this._connectionPool.close();
                        reject(err);
                    } else {

                        await this._authManager.refreshCognitoCredentials();
                        config.credentials = await this._authManager.getIamCredentials();

                        // Ingest DDL
                        const ingested = await this.ingestDDL(validTables, folderPath);

                        // Add to manifest file
                        manifest.files.push(ingested.fileName);

                        await this._connectionPool.close();

                        results.forEach((queryResult) => {
                            if (queryResult.data) {
                                aggregateMetadata.push(queryResult);
                            }
                        });

                        // Ingest metadata
                        const uploaded = await this.ingestMetadata(aggregateMetadata, folderPath);

                        manifest.files.push(uploaded.fileName);

                        // Calculate overall duration in milliseconds and write to manifest
                        const ingestFinishTime = moment();
                        const duration = ingestFinishTime.diff(ingestStartTime).toString();

                        manifest.ingestDuration = duration;
                        manifest.ingestEndTime = ingestFinishTime.toISOString();

                        const rs = new stream.Readable();
                        rs.push(JSON.stringify(manifest));
                        rs.push(null);

                        // Finally, ingest manifest file
                        await this._writer.ingest(rs, folderPath, 'manifest.json');
                        await this.raiseSnapshotCompletionEvent(integrationType as IntegrationType, completionDescription, this._bucketPath + '/' + folderPath);

                        resolve();
                    }
                }
            );
        });
    }

    private async raiseSnapshotCompletionEvent(integrationType: IntegrationType, completionTimeDescription: string, snapshotFolder: string) {
        const snapshotReceivedEventString = JSON.stringify(new SnapshotReceivedEventModel(this._tenantId, integrationType, snapshotFolder, completionTimeDescription, this._tenantName));
        const event = { default: snapshotReceivedEventString, lambda: snapshotReceivedEventString };

        this._logger.info('Sending snapshot upload completion notification');
        await this._sns.publish({
            Message: JSON.stringify(event),
            TopicArn: this._snapshotReceivedArn,
            MessageStructure: 'json'
        }).promise();
    }

    private async ingestDDL(validTables: any, folderPath) {
        const ddlQuery = await this._oracleDDLHelper.getDDLQuery(Object.keys(validTables));
        const reader = this._container.get<IDataReader>(TYPES.DataReader);
        const ddlPrefix = 'ddl';
        const queryResult = await reader.read({name: ddlPrefix, query: ddlQuery});

        return await this._writer.ingest(queryResult.result, folderPath, ddlPrefix);
    }

    private async ingestMetadata(metadata: IQueryMetadata[], folderPath: string) {
        // First build a common structure to store each queries metadata in so it
        // can be consumed later during the restoration process
        const allTableMetadata = new Map<string, any>();
        for (const queryMetadata of metadata) {
            let columnMetadata;
            const columns = [];

            while ((columnMetadata = queryMetadata.data.read()) !== null) {
                columns.push(columnMetadata);
            }

            allTableMetadata[queryMetadata.name] = columns;
        }

        // Then prepare it to stream to the destination
        const compiledMetadataStream = new Readable();
        compiledMetadataStream.push(JSON.stringify(allTableMetadata));
        compiledMetadataStream.push(null);

        return await this._writer.ingest(compiledMetadataStream, folderPath, 'metadata');
    }
}
