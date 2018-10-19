import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';
import * as BluebirdPromise from 'bluebird';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';
import IntegrationConfigFactory from '../IntegrationConfigFactory';

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
    private _reader: IDataReader;
    private _integrationConfigFactory: IntegrationConfigFactory;

    constructor(
        @inject(TYPES.DataReader) reader: IDataReader,
        @inject(TYPES.DataWriter) writer: IDataWriter,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.IntegrationConfigFactory) integrationConfigFactory: IntegrationConfigFactory) {

        this._writer = writer;
        this._reader = reader;
        this._logger = logger;
        this._integrationConfigFactory = integrationConfigFactory;
    }

    public async handle(message: SendDataMessage) {
        this._logger.silly(`Handling message: ${message.receiptHandle}`);

        // TODO: add integration type to the SendDataMessage model
        const integrationType = 'Banner';
        const integrationConfig = this._integrationConfigFactory.create(integrationType);

        try {
            await this._reader.open();

            // delegate each query statement to one Reader/Writer pair
            const statementExecutors: Array<Promise<boolean>> = [];
            for (const statement of integrationConfig.queries) {
                statementExecutors.push(this.getStatementExecutor(statement));
            }
            await BluebirdPromise.map(statementExecutors,
                (success: boolean) => { /* No action required here */ },
                { concurrency: STATEMENT_CONCURRENCY });
        } finally {
            await this._reader.close();
        }
    }

    private getStatementExecutor(queryStatement: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const startTime = Date.now();
            const readable: Readable = await this._reader.read(queryStatement);
            await this._writer.ingest(readable);
            const endTime = Date.now();
            const diff = moment.duration(endTime - startTime);

            this._logger.info(`Ingestion took ${diff.humanize(false)} (${diff.asMilliseconds()}ms)`);
            resolve(true);
        });
    }
}
