import { Readable, Stream } from 'stream';
import { inject, injectable } from 'inversify';
import TYPES from '../../../ioc.types';
import * as crypto from 'crypto';

import IDataWriter from '../IDataWriter';
import { Logger } from 'winston';
import IOutputEncoder from '../IOutputEncoder';

import { AuthManager } from '../../Auth';
import { S3 } from 'aws-sdk';
import { CognitoIdentityCredentials, config } from 'aws-sdk/global';

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
        @inject(TYPES.AuthManager) private _authManager: AuthManager) {

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

        const params = {
            Body: dataBody,
            Bucket:  this._bucketPath + '/' + folderPath,
            // No explicit extension if not a data file
            Key: `${fileNamePrefix}${fileSuffix}`
        };

        dataBody.on('pause', () => {
            this._logger.silly(`Read stream paused for ${fileNamePrefix}`);
        });

        dataBody.on('resume', () => {
            this._logger.silly(`Read stream resuming for ${fileNamePrefix}`);
        });

        dataBody.on('close', () => {
            this._logger.silly(`Read stream closed for ${fileNamePrefix}`);
        });

        dataBody.on('error', () => {
            this._logger.silly(`Read stream errored for ${fileNamePrefix}`);
        });

        dataBody.on('end', () => {
            this._logger.silly(`Read stream ended for ${fileNamePrefix}`);
        });

        config.credentials = await this._authManager.refresh();

        // Parallelize multi-part upload
        const s3Obj = new S3();
        const managedUpload: S3.ManagedUpload = s3Obj.upload(params,
            { partSize: 1024 * 1024 * this.S3_PART_SIZE_MB, queueSize: this.S3_QUEUE_SIZE });

        managedUpload.on('httpUploadProgress', async (evt) => {
            this._logger.verbose(`Progress: ${evt.loaded} bytes uploaded (File: ${params.Key})`);
            this._logger.silly('Refreshing credentials on S3 instance and AWS config (if needed)...');
            (s3Obj.config.credentials as CognitoIdentityCredentials).clearCachedId();
            (config.credentials as CognitoIdentityCredentials).clearCachedId();
            const creds = await this._authManager.refresh();
            config.credentials = creds;
            s3Obj.config.credentials = creds;
        });

        await managedUpload.promise();

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
