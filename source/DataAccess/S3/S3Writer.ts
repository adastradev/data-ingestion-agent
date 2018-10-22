import { Readable, Stream } from 'stream';
import { S3 } from 'aws-sdk';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import * as crypto from 'crypto';

import IDataWriter from '../IDataWriter';
import { Logger } from 'winston';
import AWS = require('aws-sdk');

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

    public async ingest(stream: Readable, folderPath: string) {
        const dataBody = stream;
        const parms = {
            Body: dataBody,
            Bucket:  this._bucket + '/' + this._tenantId + '/' + folderPath,
            Key: 'testUpload-' + crypto.randomBytes(8).toString('hex')
        };

        // Parallelize 2x5MB chunks at a time...or at least try to
        // TODO: Make performance settings configurable? via config? via sqs? per table? per client?
        const s3Obj = new AWS.S3();
        const managedUpload: AWS.S3.ManagedUpload = s3Obj.upload(parms, { partSize: 1024 * 1024 * 5, queueSize: 3  });

        managedUpload.on('httpUploadProgress', (evt) => {
            this._logger.info(`Progress: ${evt.loaded} bytes uploaded`);
        });

        await managedUpload.promise();
    }
}
