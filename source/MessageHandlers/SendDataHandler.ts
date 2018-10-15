import IMessageHandler from "../IMessageHandler";
import TYPES from "../../ioc.types";

import { S3, SQS } from "aws-sdk";
import { Logger } from "winston";

import * as crypto from 'crypto';
import * as oracledb from 'oracledb';
import { injectable, inject } from "inversify";
import "reflect-metadata";
import SendDataMessage from "../Messages/SendDataMessage";
import IIngestionReader from "../DataAccess/IIngestionReader";
import IIngestionWriter from "../DataAccess/IIngestionWriter";
import { ReadStream, read } from "fs";

@injectable()
export default class SendDataHandler implements IMessageHandler {

    constructor(
        @inject(TYPES.SQSConfig) sqsConfig: SQS.ClientConfiguration,
        @inject(TYPES.IngestionReader) reader: IIngestionReader,
        @inject(TYPES.IngestionWriter) writer: IIngestionWriter,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.QueueUrl) queueUrl: string) {

        this._sqsConfig = sqsConfig;
        this._writer = writer;
        this._reader = reader;
        this._logger = logger;
        this._queueUrl = queueUrl;
    }

    private _sqsConfig: SQS.ClientConfiguration;
    private _logger: Logger; 
    private _queueUrl: string;
    private _writer: IIngestionWriter;
    private _reader: IIngestionReader;
    
    public async handle(message: SendDataMessage) {
        console.log(`Handling message: ${message.receiptHandle}`);

        // NOTE: This is just a first go at fetching and uploading data
        //       Depending on performance characteristics we may not
        //       be able to assume we can perform the ingestion in the same
        //       process/thread, especially in just one pass...
        var readable = await this._reader.queryStream();

        if (message.payload.preview) {
            this._reader.logQueries();   
        }
        else {
            this._writer.ingest(readable);
        }

        await this.acknowledgeMessage(message);      
    }

    private async acknowledgeMessage(message: SendDataMessage) {
        console.log(`Acknowledging message: ${message.receiptHandle}`);
        
        const sqsApi = new SQS(this._sqsConfig);
        await sqsApi.deleteMessage({ QueueUrl: this._queueUrl, ReceiptHandle: message.receiptHandle }).promise();
    }
}