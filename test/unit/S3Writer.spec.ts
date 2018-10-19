
import 'reflect-metadata';
import * as chai from 'chai';
import * as AWS from 'aws-sdk-mock';

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
            let uploadCalls = 0;

            const waitForCompletionStub = sinon.stub(S3Writer.prototype, 'waitForCompletion' as any)
                .resolves({ total: 10, loaded: 10});

            AWS.mock('S3', 'upload', (params, callback) => {
                uploadCalls++;
                expect(params.Bucket).to.eq('some_bucket/some_tenant_id');
                expect(params.Key).to.contain('testUpload-');
                expect(params.Body).to.be.instanceof(Readable);
            });

            const stream: Readable = new Readable();
            stream.push('test');
            stream.push(null);
            await s3Writer.ingest(stream);

            expect(waitForCompletionStub.calledOnce).to.be.true;
            expect(uploadCalls).to.eq(1);

            AWS.restore('S3', 'send');
            waitForCompletionStub.restore();
        });
    });
});
