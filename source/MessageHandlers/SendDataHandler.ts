import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

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
        this.logger.log('info', `Handling message: ${message.receiptHandle}`);

        // NOTE: This is just a first go at fetching and uploading data
        //       Depending on performance characteristics we may not
        //       be able to assume we can perform the ingestion in the same
        //       process/thread, especially in just one pass...
        const readable: Readable = await this.reader.read();
        await this.writer.ingest(readable);
        this.reader.close();
    }
}
