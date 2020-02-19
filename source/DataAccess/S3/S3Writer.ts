import { Readable, Stream } from 'stream';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import * as crypto from 'crypto';

import IDataWriter from '../IDataWriter';
import { Logger } from 'winston';
import AWS = require('aws-sdk');
import IOutputEncoder from '../IOutputEncoder';
import { CustomAuthManager } from '../../Auth/CustomAuthManager';

/**
 * Given a readable stream ingest data into an S3 bucket
 *
 * @export
 * @class S3Writer
 * @implements {IDataWriter}
 */
@injectable()
export default class S3Writer implements IDataWriter {

    private readonly S3_PART_SIZE_MB: number;
    private readonly S3_QUEUE_SIZE: number;
    constructor(
        @inject(TYPES.Bucket) private _bucketPath: string,
        @inject(TYPES.OutputEncoder) private _outputEncoder: IOutputEncoder,
        @inject(TYPES.Logger) private _logger: Logger,
        @inject(TYPES.AuthManager) private _authManager: CustomAuthManager,
        @inject(TYPES.TenantId) private _tenantId: string) {

        this.S3_PART_SIZE_MB = 10;
        if (process.env.S3_PART_SIZE_MB) {
            this.S3_PART_SIZE_MB = Number(process.env.S3_PART_SIZE_MB);
        }
        this.S3_QUEUE_SIZE = 10;
        if (process.env.S3_QUEUE_SIZE) {
            this.S3_QUEUE_SIZE = Number(process.env.S3_QUEUE_SIZE);
        }
    }

    public async ingest(stream: Readable, folderPath: string, fileNamePrefix: string) {
        let dataBody = stream;
        const dataFile = this.isDataFile(fileNamePrefix);
        let extension = '';

        if (dataFile) {
            const encodingResult = this._outputEncoder.encode(stream);
            dataBody = encodingResult.outputStream;
            extension = '.' + encodingResult.extension.replace('.', '');
        }

        const fileSuffix = dataFile ?
            // If it's a data file, add hash and extension
            '_' + crypto.randomBytes(8).toString('hex') + extension
            // Otherwise, don't
            : '';

        const params: AWS.S3.PutObjectRequest = {
            Body: dataBody,
            Bucket:  this._bucketPath + '/' + folderPath,
            // No explicit extension if not a data file
            Key: `${fileNamePrefix}${fileSuffix}`,
            Tagging: `tenant_id=${this._tenantId}`
        };

        await this._authManager.refreshCognitoCredentials(fileNamePrefix);

        // In case we experience a long wait between running the
        // query and the first receipt of the result refresh the
        // credentials on an interval independent of the httpUploadProgress
        // event call. This *should* refresh the token for this thread/S3 client
        // and no other, maybe.
        const intervalToken = setInterval(async () => {
            await this._authManager.refreshCognitoCredentials(fileNamePrefix);
        }, 1000 * 60 * CustomAuthManager.MINUTES_BEFORE_ALLOW_REFRESH);

        // Parallelize multi-part upload
        const s3Obj = new AWS.S3();
        const managedUpload: AWS.S3.ManagedUpload = s3Obj.upload(params,
            { partSize: 1024 * 1024 * this.S3_PART_SIZE_MB, queueSize: this.S3_QUEUE_SIZE });

        managedUpload.on('httpUploadProgress', (evt) => {
            this._logger.verbose(`Progress: ${evt.loaded} bytes uploaded (File: ${params.Key})`);
            this._authManager.refreshCognitoCredentials(fileNamePrefix).then(() => {
                return true;
            });
        });

        await managedUpload.promise().then((v) => clearInterval(intervalToken));

        return {
            fileName: params.Key,
            bucket: params.Bucket
        };
    }

    private isDataFile(fileNamePrefix): boolean {
        switch (fileNamePrefix) {
            case 'ddl':
            case 'metadata':
            case 'manifest.json':
                return false;
            default:
                return true;
        }
    }
}
