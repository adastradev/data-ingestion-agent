
import 'reflect-metadata';
import * as chai from 'chai';
chai.should();
import * as awssdk from 'aws-sdk';

import container from './test.inversify.config';
import S3Writer from '../../source/DataAccess/S3/S3Writer';
import { Readable } from 'stream';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import * as sinon from 'sinon';
import IOutputEncoder, { IEncodeResult } from '../../source/DataAccess/IOutputEncoder';

const expect = chai.expect;

class DummyEncoder implements IOutputEncoder {
    public encode(inputStream: Readable): IEncodeResult {
        return { outputStream: inputStream, extension: 'abc' };
    }
}

describe('S3Writer', () => {

    describe('when ingesting data', () => {

        const sandbox: sinon.SinonSandbox = sinon.createSandbox();

        afterEach(() => {
            sandbox.restore();
        });

        const testCases = [
            { FileNamePrefix: 'somedatafile', ShouldEncode: true },
            { FileNamePrefix: 'metadata', ShouldEncode: false },
            { FileNamePrefix: 'ddl', ShouldEncode: false }
        ];

        for (const testCase of testCases) {
            it(`should upload data to S3 with a filePrefix of ${testCase.FileNamePrefix}`, async () => {
                const logger: Logger = container.get<Logger>(TYPES.Logger);
                const encoderStub = new DummyEncoder();
                const encoderSpy = sandbox.spy(encoderStub, 'encode');
                const s3Writer = new S3Writer('some_bucket/some_tenant_id', encoderStub, logger);
                const result = {} as awssdk.S3.ManagedUpload.SendData;

                const dummyPromise = (): Promise<awssdk.S3.ManagedUpload.SendData> => {
                    return Promise.resolve(result);
                };

                awssdk.S3.ManagedUpload.prototype.promise = dummyPromise;

                const spy = sandbox.spy(dummyPromise);
                const mockMgu = sandbox.mock(awssdk.S3.ManagedUpload.prototype) as any;
                mockMgu.promise = spy;
                mockMgu.on = () => { /* Dummy */ };

                const upload = sandbox.stub(awssdk.S3.prototype, 'upload');
                upload.returns(mockMgu);

                const stream: Readable = new Readable();
                stream.push('test');
                stream.push(null);
                await s3Writer.ingest(stream, 'mockPath', testCase.FileNamePrefix);

                expect(upload.calledOnce).to.be.true;
                expect(upload.getCalls()[0].args[0].Bucket).to.eq('some_bucket/some_tenant_id/mockPath');
                expect(upload.getCalls()[0].args[0].Key).to.contain(`${testCase.FileNamePrefix}_`);

                expect(encoderSpy.calledOnce).to.eq(testCase.ShouldEncode);

                expect(upload.getCalls()[0].args[0].Body).to.be.instanceof(Readable);
            });
        }
    });
});
