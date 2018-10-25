import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { Container, inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader, { IQueryResult } from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';
import IntegrationConfigFactory from '../IntegrationConfigFactory';
import IConnectionPool from '../DataAccess/IConnectionPool';
import { IQueryDefinition, IQueryMetadata } from '../IIntegrationConfig';
import { mapLimit } from 'async';

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

    constructor(
        @inject(TYPES.DataWriter) writer: IDataWriter,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.IntegrationConfigFactory) integrationConfigFactory: IntegrationConfigFactory,
        @inject(TYPES.ConnectionPool) connectionPool: IConnectionPool,
        @inject(TYPES.Container) container: Container) {

        this._writer = writer;
        this._logger = logger;
        this._integrationConfigFactory = integrationConfigFactory;
        this._connectionPool = connectionPool;
        this._container = container;
    }

    public async handle(message: SendDataMessage) {
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        const integrationType = process.env.INTEGRATION_TYPE || 'Banner';
        const integrationConfig = this._integrationConfigFactory.create(integrationType);
        const folderPath = integrationType + '-' + moment().toISOString();

        try {
            await this._connectionPool.open();

            const aggregateMetadata: IQueryMetadata[] = new Array<IQueryMetadata>();

            mapLimit(integrationConfig.queries, STATEMENT_CONCURRENCY,
                async (queryStatement: IQueryDefinition, queryCollback: any) => { // iterator value callback
                    let reader: IDataReader;
                    let itemMetadata: Readable;
                    try {
                        const startTime = Date.now();

                        reader = this._container.get<IDataReader>(TYPES.DataReader);
                        const readable: IQueryResult = await reader.read(queryStatement.query);
                        itemMetadata = readable.metadata;
                        await this._writer.ingest(readable.result, folderPath, queryStatement.name);
                        const endTime = Date.now();
                        const diff = moment.duration(endTime - startTime);
                        this._logger.info(`Ingestion took ${diff.humanize(false)} (${diff.asMilliseconds()}ms)`);
                    } catch (err) {
                        queryCollback(err);
                    } finally {
                        if (reader) {
                            await reader.close();
                        }
                    }
                    queryCollback(null, { name: queryStatement.name, data: itemMetadata});
                },
                (err, results) => { // async.mapLimit callback
                    results.forEach((queryResult) => {
                        aggregateMetadata.push(queryResult.data);
                    });
                }
            );

            await this.ingestMetadata(aggregateMetadata, folderPath);

        } finally {
            await this._connectionPool.close();
        }
    }

    private async ingestMetadata(metadata: IQueryMetadata[], folderPath: string) {
        // First build a common structure to store each queries metadata in so it
        // can be consumed later during the restoration process
        const allTableMetadata = new Map<string, any>();
        for (const queryMetadata of metadata) {
            let columnMetadata;
            const columns = [];
            // tslint:disable-next-line:no-conditional-assignment
            while ((columnMetadata = queryMetadata.data.read()) !== null) {
                columns.push(columnMetadata);
            }

            allTableMetadata[queryMetadata.name] = columns;
        }

        // Then prepare it to stream to the destination
        const compiledMetadataStream = new Readable();
        compiledMetadataStream.push(JSON.stringify(allTableMetadata));
        compiledMetadataStream.push(null);

        await this._writer.ingest(compiledMetadataStream, folderPath, 'metadata');
    }
}
