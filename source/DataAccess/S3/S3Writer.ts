import { Readable, Stream } from 'stream';
import { S3 } from 'aws-sdk';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import * as crypto from 'crypto';

import IDataWriter from '../IDataWriter';
import { Logger } from 'winston';
import AWS = require('aws-sdk');

let S3_PART_SIZE_MB = 10;
if (process.env.S3_PART_SIZE_MB) {
    S3_PART_SIZE_MB = Number(process.env.S3_PART_SIZE_MB);
}
let S3_QUEUE_SIZE = 10;
if (process.env.S3_QUEUE_SIZE) {
    S3_QUEUE_SIZE = Number(process.env.S3_QUEUE_SIZE);
}

/**
 * Given a readable stream ingest data into an S3 bucket
 *
 * @export
 * @class S3Writer
 * @implements {IDataWriter}
 */
@injectable()
export default class S3Writer implements IDataWriter {
    private _tenantId: string;
    private _bucket: string;
    private _logger: Logger;

    constructor(
        @inject(TYPES.TenantId) tenantId: string,
        @inject(TYPES.Bucket) bucket: string,
        @inject(TYPES.Logger) logger: Logger) {
        this._tenantId = tenantId;
        this._bucket = bucket;
        this._logger = logger;
    }

    public async ingest(stream: Readable, folderPath: string, fileNamePrefix: string) {
        const dataBody = stream;
        const parms = {
            Body: dataBody,
            Bucket:  this._bucket + '/' + this._tenantId + '/' + folderPath,
            Key: fileNamePrefix + '_' + crypto.randomBytes(8).toString('hex')
        };

        // Parallelize multi-part upload
        const s3Obj = new AWS.S3();
        const managedUpload: AWS.S3.ManagedUpload = s3Obj.upload(parms,
            { partSize: 1024 * 1024 * S3_PART_SIZE_MB, queueSize: S3_QUEUE_SIZE });

        managedUpload.on('httpUploadProgress', (evt) => {
            this._logger.verbose(`Progress: ${evt.loaded} bytes uploaded (File: ${parms.Key})`);
        });

        await managedUpload.promise();
    }
}
