import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { Container, inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';
import * as BluebirdPromise from 'bluebird';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';
import IntegrationConfigFactory from '../IntegrationConfigFactory';
import IConnectionPool from '../DataAccess/IConnectionPool';

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
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        // TODO: add integration type to the SendDataMessage model
        const integrationType = 'Banner';
        const integrationConfig = this._integrationConfigFactory.create(integrationType);

        try {
            await this._connectionPool.open();

            // delegate each query statement to one Reader/Writer pair
            const statementExecutors: Array<Promise<boolean>> = [];
            for (const statement of integrationConfig.queries) {
                statementExecutors.push(this.getStatementExecutor(statement));
            }

            // execute the query statements in parallel, limiting to avoid too much CPU/RAM consumption
            await BluebirdPromise.map(statementExecutors,
                (success: boolean) => { /* No action required here */ },
                { concurrency: STATEMENT_CONCURRENCY });
        } finally {
            await this._connectionPool.close();
        }
    }

    private getStatementExecutor(queryStatement: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let reader;
            try {
                const startTime = Date.now();

                reader = this._container.get<IDataReader>(TYPES.DataReader);
                const readable: Readable = await reader.read(queryStatement);
                await this._writer.ingest(readable);
                const endTime = Date.now();
                const diff = moment.duration(endTime - startTime);

                this._logger.info(`Ingestion took ${diff.humanize(false)} (${diff.asMilliseconds()}ms)`);
            } finally {
                if (reader) {
                    await reader.close();
                }
            }
            resolve(true);
        });
    }
}
