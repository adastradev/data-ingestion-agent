import IMessageHandler from '../IMessageHandler';
import TYPES from '../../ioc.types';

import { Readable } from 'stream';
import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import SendDataMessage from '../Messages/SendDataMessage';
import IIngestionReader from '../DataAccess/IDataReader';
import IIngestionWriter from '../DataAccess/IDataWriter';

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
    private writer: IIngestionWriter;
    private reader: IIngestionReader;

    constructor(
        @inject(TYPES.IngestionReader) reader: IIngestionReader,
        @inject(TYPES.IngestionWriter) writer: IIngestionWriter,
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
    }
}
