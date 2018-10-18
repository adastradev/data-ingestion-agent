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

    private _s3Config: S3.ClientConfiguration;
    private _tenantId: string;
    private _bucket: string;
    private _logger: Logger;

    constructor(
        @inject(TYPES.S3Config) s3Config: S3.ClientConfiguration,
        @inject(TYPES.TenantId) tenantId: string,
        @inject(TYPES.Bucket) bucket: string,
        @inject(TYPES.Logger) logger: Logger) {
        this._s3Config = s3Config;
        this._tenantId = tenantId;
        this._bucket = bucket;
        this._logger = logger;
    }

    public async ingest(stream: Readable) {
        const s3api = new S3(this._s3Config);

        const dataBody = stream;
        const parms = {
            Body: dataBody,
            Bucket:  this._bucket + '/' + this._tenantId,
            Key: 'testUpload-' + crypto.randomBytes(8).toString('hex')
        };

        // Parallelize 2x5MB chunks at a time...or at least try to
        // TODO: Make performance settings configurable? via config? via sqs? per table? per client?
        const s3Obj = new AWS.S3();
        const managedUpload: AWS.S3.ManagedUpload = s3Obj.upload(parms, { partSize: 1024 * 1024 * 5, queueSize: 3  });

        await this.waitForCompletion(managedUpload);
    }

    private async waitForCompletion(managedUpload: AWS.S3.ManagedUpload) {
        const ingestionCompletion = new Promise((resolve, reject) => {
            managedUpload.on('httpUploadProgress', (evt) => {
                this._logger.info(`Progress: ${evt.loaded} bytes uploaded`);

                // Only resolve when we're done
                // not sure of the reporting accuracy for bytes sent so leaving as gte
                if (evt.loaded >= evt.total) {
                    resolve(evt);
                }
            });
        });

        managedUpload.send((err, data) => {
            if (err) {
                this._logger.error(err.message);
            } else {
                this._logger.info(`Upload complete - Bucket Location: ${data.Location}`);
            }
        });

        await ingestionCompletion;
    }
}
