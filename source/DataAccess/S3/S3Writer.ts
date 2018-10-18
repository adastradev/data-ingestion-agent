import { Readable } from 'stream';
import { S3 } from 'aws-sdk';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import * as crypto from 'crypto';

import IDataWriter from '../IDataWriter';

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

    constructor(
        @inject(TYPES.TenantId) tenantId: string,
        @inject(TYPES.Bucket) bucket: string) {
        this._tenantId = tenantId;
        this._bucket = bucket;
    }

    public async ingest(stream: Readable) {
        const s3api = new S3();

        const dataBody = stream;
        const params = {
            Body: dataBody,
            Bucket:  this._bucket + '/' + this._tenantId,
            Key: 'testUpload-' + crypto.randomBytes(8).toString('hex')
        };

        await s3api.upload(params).promise();
    }
}
