import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as moment from 'moment';

import SendDataMessage from '../Messages/SendDataMessage';
import IDataReader from '../DataAccess/IDataReader';
import IDataWriter from '../DataAccess/IDataWriter';

/**
 * Handles messages received to instruct the agent to being its ingestion process
 *
 * @export
 * @class SendDataHandler
 * @implements {IMessageHandler}
 */
@injectable()
export default class SendDataHandler implements IMessageHandler {

    private logger: Logger;
    private writer: IDataWriter;
    private reader: IDataReader;

    constructor(
        @inject(TYPES.DataReader) reader: IDataReader,
        @inject(TYPES.DataWriter) writer: IDataWriter,
        @inject(TYPES.Logger) logger: Logger) {

        this.writer = writer;
        this.reader = reader;
        this.logger = logger;
    }

    public async handle(message: SendDataMessage) {
        this.logger.silly(`Handling message: ${message.receiptHandle}`);

        const startTime = Date.now();

        const readable: Readable = await this.reader.read();
        await this.writer.ingest(readable);
        this.reader.close();

        const endTime = Date.now();
        const diff = moment.duration(endTime - startTime);

        this.logger.info(`Ingestion took ${diff.humanize(false)} (${diff.asMilliseconds()}ms)`);
    }
}
