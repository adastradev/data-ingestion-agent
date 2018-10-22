import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { Container, inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';
import * as BluebirdPromise from 'bluebird';
import * as CombinedStream from 'combined-stream';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader, { IQueryResult } from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';
import IntegrationConfigFactory from '../IntegrationConfigFactory';
import IConnectionPool from '../DataAccess/IConnectionPool';
import { IQueryDefinition, IQueryMetadata } from '../IIntegrationConfig';
import { WriteStream } from 'tty';

const STATEMENT_CONCURRENCY = 5;
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
        const captureStart = moment();
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        // TODO: add integration type to the SendDataMessage model
        const integrationType = 'Banner';
        const integrationConfig = this._integrationConfigFactory.create(integrationType);
        const folderPath = integrationType + '-' + captureStart.format(); // Uses moment.ISO_8601

        try {
            await this._connectionPool.open();

            // delegate each query statement to one Reader/Writer pair
            const statementExecutors: Array<Promise<IQueryMetadata>> = [];
            for (const statement of integrationConfig.queries) {
                statementExecutors.push(this.getStatementExecutor(statement, folderPath));
            }

            // execute the query statements in parallel, limiting to avoid too much CPU/RAM consumption
            const metadata: IQueryMetadata[] = new Array<IQueryMetadata>();
            await BluebirdPromise.map(statementExecutors,
                (success: IQueryMetadata) => { metadata.push(success); },
                { concurrency: STATEMENT_CONCURRENCY });

            const cs = CombinedStream.create();
            for (const queryMetadata of metadata) {
                cs.append(queryMetadata);
            }

            this._writer.ingest(cs, folderPath);
        } finally {
            await this._connectionPool.close();
        }
    }

    private getStatementExecutor(queryStatement: IQueryDefinition, folderPath: string): Promise<IQueryMetadata> {
        return new Promise(async (resolve, reject) => {
            let reader: IDataReader;
            let metadata: Readable;
            try {
                const startTime = Date.now();

                reader = this._container.get<IDataReader>(TYPES.DataReader);
                const readable: IQueryResult = await reader.read(queryStatement.query);
                metadata = readable.metadata;
                await this._writer.ingest(readable.result, folderPath);
                const endTime = Date.now();
                const diff = moment.duration(endTime - startTime);

                this._logger.info(`Ingestion took ${diff.humanize(false)} (${diff.asMilliseconds()}ms)`);
            } finally {
                if (reader) {
                    await reader.close();
                }
            }
            resolve({ name: queryStatement.name, data: metadata});
        });
    }
}
