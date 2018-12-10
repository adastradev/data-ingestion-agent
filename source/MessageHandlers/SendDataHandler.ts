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
import DurationLogger from '../Util/DurationLogger';

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
    private _durationLogger: DurationLogger;

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
        @inject(TYPES.DurationLogger) durationLogger: DurationLogger) {

        this._writer = writer;
        this._logger = logger;
        this._integrationConfigFactory = integrationConfigFactory;
        this._connectionPool = connectionPool;
        this._container = container;
        this._sns = sns;
        this._snapshotReceivedArn = snapshotReceivedArn;
        this._bucketPath = bucketPath;
        this._tenantName = tenantName;
        this._durationLogger = durationLogger;
    }

    public async handle(message: SendDataMessage) {
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        const integrationType = IntegrationType[process.env.INTEGRATION_TYPE] || IntegrationType.Banner;
        const integrationConfig = this._integrationConfigFactory.create(integrationType);
        const folderPath = integrationType + '-' + moment().toISOString();

        await this._connectionPool.open();

        const aggregateMetadata: IQueryMetadata[] = new Array<IQueryMetadata>();

        return new Promise<void>((resolve, reject) => {
            let durationDescription: string;
            const validTables = {};
            for (const tbl of integrationConfig.queries.map((q) => q.name)) {
                validTables[tbl] = tbl;
            }

            mapLimit(integrationConfig.queries, STATEMENT_CONCURRENCY,
                async (queryDefinition: IQueryDefinition, queryCallback: any) => { // iterator value callback
                    let reader: IDataReader;
                    let itemMetadata: Readable;

                    try {
                        this._durationLogger.start(`Ingestion for '${queryDefinition.name} took ${DurationLogger.DURATION_TOKEN}`);
                        reader = this._container.get<IDataReader>(TYPES.DataReader);
                        const queryResult: IQueryResult = await reader.read(queryDefinition);
                        itemMetadata = queryResult.metadata;
                        await this._writer.ingest(queryResult.result, folderPath, queryDefinition.name);
                        durationDescription = this._durationLogger.stop();
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
                    queryCallback(null, { name: queryDefinition.name, data: itemMetadata});
                },
                async (err, results) => { // async.mapLimit callback
                    if (err) {
                        await this._connectionPool.close();
                        reject(err);
                    } else {
                        await this.ingestDDL(validTables, folderPath);

                        await this._connectionPool.close();

                        results.forEach((queryResult) => {
                            if (queryResult.data) {
                                aggregateMetadata.push(queryResult);
                            }
                        });

                        await this.ingestMetadata(aggregateMetadata, folderPath);

                        await this.raiseSnapshotCompletionEvent(integrationType, durationDescription, this._bucketPath + '/' + folderPath);

                        resolve();
                    }
                }
            );
        });
    }

    private async raiseSnapshotCompletionEvent(integrationType: IntegrationType, durationTimeDescription: string, snapshotFolder: string) {
        const tenantId = this._bucketPath.split('/')[1];
        const snapshotReceivedEventString = JSON.stringify(new SnapshotReceivedEventModel(tenantId, integrationType, snapshotFolder, durationTimeDescription, this._tenantName));
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

        this._durationLogger.start(`Ingestion for 'ddl' took ${DurationLogger.DURATION_TOKEN}`);
        const queryResult = await reader.read({name: ddlPrefix, query: ddlQuery});
        await this._writer.ingest(queryResult.result, folderPath, ddlPrefix);
        this._durationLogger.stop();
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

        this._durationLogger.start(`Ingestion for 'metadata' took ${DurationLogger.DURATION_TOKEN}`);
        await this._writer.ingest(compiledMetadataStream, folderPath, 'metadata');
        this._durationLogger.stop();
    }
}
