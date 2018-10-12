import IMessageHandler from "../IMessageHandler";
import TYPES from "../../ioc.types";

import { S3, SQS } from "aws-sdk";
import { Logger } from "winston";

import * as crypto from 'crypto';
import * as oracledb from 'oracledb';
import { injectable, inject } from "inversify";
import "reflect-metadata";
import SendDataMessage from "../Messages/SendDataMessage";
import { AuthManager } from "../astra-sdk/AuthManager";

@injectable()
export default class SendDataHandler implements IMessageHandler {

    constructor(
        @inject(TYPES.S3Config) s3Config: S3.ClientConfiguration,
        @inject(TYPES.SQSConfig) sqsConfig: SQS.ClientConfiguration,
        @inject(TYPES.Logger) logger: Logger,
        @inject(TYPES.TenantId) tenantId: string,
        @inject(TYPES.Bucket) bucket: string,
        @inject(TYPES.QueueUrl) queueUrl: string) {
        
        this._s3Config = s3Config;
        this._sqsConfig = sqsConfig;
        this._logger = logger;
        this._tenantId = tenantId;
        this._bucket = bucket;
        this._queueUrl = queueUrl;
    }

    private _s3Config: S3.ClientConfiguration;
    private _sqsConfig: SQS.ClientConfiguration;
    private _logger: Logger; 
    private _tenantId: string;
    private _bucket: string;
    private _queueUrl: string;
    
    private readonly queries = [
        'SELECT * FROM ALL_TABLES'
    ];

    public async handle(message: SendDataMessage) {
        console.log(`Handling message: ${message.receiptHandle}`);

        await this.sendSnapshot(this._s3Config, this._tenantId, this._bucket, message.payload.preview);
        await this.acknowledgeMessage(message);      
    }

    private async acknowledgeMessage(message: SendDataMessage) {
        console.log(`Acknowledging message: ${message.receiptHandle}`);
        // TODO: Consider moving into base class or decorator pattern..or even TS decorator?
        const sqsApi = new SQS(this._sqsConfig);
        await sqsApi.deleteMessage({ QueueUrl: this._queueUrl, ReceiptHandle: message.receiptHandle }).promise();
    }
    
    private createDemoSnapshot() {
        var Readable = require('stream').Readable
        var s = new Readable;
        s.push('this is a test stream');
        s.push(null);
        return s;
    }
    
    private async createSnapshot() {
        if (process.env.ORACLE_ENDPOINT === undefined) {
            return this.createDemoSnapshot();
        }

        let connection;
        try {
            let sql, binds, options, result;

            connection = await oracledb.getConnection({
              user          : process.env.ORACLE_USER,
              password      : process.env.ORACLE_PASSWORD,
              connectString : process.env.ORACLE_ENDPOINT
            });

            // Query the data
            binds = {};
            options = {
              outFormat: oracledb.OBJECT // query result format
            };
            result = await connection.execute(this.queries[0], binds, options);

            var Readable = require('stream').Readable
            var s = new Readable;
            result.rows.forEach(element => {
                s.push(JSON.stringify(element));
                s.push('\n');
            });
            s.push(null);
            return s;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    private async sendSnapshot(s3Config: S3.ClientConfiguration, tenantId: string, bucketName: string, preview: boolean = false) {
        const s3api = new S3(s3Config);

        var dataBody = await this.createSnapshot();
        var params = {
            Bucket:  bucketName + '/' + tenantId,
            Body: dataBody,
            Key: 'testUpload-' + crypto.randomBytes(8).toString('hex')
        };

        if (preview) {
            this._logger.log("info", this.queries[0]);
        }
        else {
            await s3api.upload(params).promise();
        }
    }
}