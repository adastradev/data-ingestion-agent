
import 'reflect-metadata';
import * as chai from 'chai';
chai.should();
import * as awssdk from 'aws-sdk';

import container from './test.inversify.config';
import S3Writer from '../../source/DataAccess/S3/S3Writer';
import { Readable } from 'stream';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import sinon = require('sinon');

const expect = chai.expect;

describe('S3Writer', () => {

    describe('when ingesting data', () => {

        it('should upload data to S3', async () => {
            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const s3Writer = new S3Writer('some_tenant_id', 'some_bucket', logger);
            const result = {} as awssdk.S3.ManagedUpload.SendData;

            const dummyPromise = (): Promise<awssdk.S3.ManagedUpload.SendData> => {
                return Promise.resolve(result);
            };

            awssdk.S3.ManagedUpload.prototype.promise = dummyPromise;

            const spy = sinon.spy(dummyPromise);
            const mockMgu = sinon.mock(awssdk.S3.ManagedUpload.prototype) as any;
            mockMgu.promise = spy;
            mockMgu.on = () => { /* Dummy */ };

            const upload = sinon.stub(awssdk.S3.prototype, 'upload');
            upload.returns(mockMgu);

            const stream: Readable = new Readable();
            stream.push('test');
            stream.push(null);
            await s3Writer.ingest(stream);

            expect(upload.calledOnce).to.be.true;
            expect(upload.getCalls()[0].args[0].Bucket).to.eq('some_bucket/some_tenant_id');
            expect(upload.getCalls()[0].args[0].Key).to.contain('testUpload-');
            expect(upload.getCalls()[0].args[0].Body).to.be.instanceof(Readable);
        });
    });
});
