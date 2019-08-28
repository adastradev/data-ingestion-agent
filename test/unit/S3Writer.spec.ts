
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
import { CustomAuthManager } from '../../source/Auth/CustomAuthManager';

const expect = chai.expect;

const stubAuthManager = {
    refreshCognitoCredentials: () => {
        return new Promise((resolve) => {
            resolve();
        });
    }
} as CustomAuthManager;

class DummyEncoder implements IOutputEncoder {
    public encode(inputStream: Readable): IEncodeResult {
        return { outputStream: inputStream, extension: 'abc' };
    }
}

describe('S3Writer', () => {

    describe('when ingesting data', () => {

        const sandbox: sinon.SinonSandbox = sinon.createSandbox();

        afterEach(() => {
            if (process.env.S3_PART_SIZE_MB) {
                delete process.env.S3_PART_SIZE_MB;
            }
            if (process.env.S3_QUEUE_SIZE) {
                delete process.env.S3_QUEUE_SIZE;
            }
            sandbox.restore();
        });

        const testCases = [
            { FileNamePrefix: 'somedatafile', ShouldEncode: true },
            { FileNamePrefix: 'metadata', ShouldEncode: false },
            { FileNamePrefix: 'ddl', ShouldEncode: false },
            { FileNamePrefix: 'someotherdatafile', ShouldEncode: true, S3_PART_SIZE_MB: '15', S3_QUEUE_SIZE: '15' }
        ];

        for (const testCase of testCases) {
            it(`should upload data to S3 with a filePrefix of ${testCase.FileNamePrefix}`, async () => {
                if (testCase.S3_PART_SIZE_MB) {
                    process.env.S3_PART_SIZE_MB = testCase.S3_PART_SIZE_MB;
                }
                if (testCase.S3_QUEUE_SIZE) {
                    process.env.S3_QUEUE_SIZE = testCase.S3_QUEUE_SIZE;
                }
                const logger: Logger = container.get<Logger>(TYPES.Logger);
                const encoderStub = new DummyEncoder();
                const encoderSpy = sandbox.spy(encoderStub, 'encode');
                const s3Writer = new S3Writer('some_bucket/some_tenant_id', encoderStub, logger, stubAuthManager);
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
                const ingested = await s3Writer.ingest(stream, 'mockPath', testCase.FileNamePrefix);

                expect(upload.calledOnce).to.be.true;
                expect(ingested.fileName).to.include(testCase.FileNamePrefix);
                expect(encoderSpy.calledOnce).to.eq(testCase.ShouldEncode);

                const uploadArgOptions = upload.getCalls()[0].args[0];
                expect(uploadArgOptions.Bucket).to.eq('some_bucket/some_tenant_id/mockPath');
                expect(uploadArgOptions.Key).to.contain(`${testCase.FileNamePrefix}`);
                expect(uploadArgOptions.Body).to.be.instanceof(Readable);

                const uploadArgPartConfig = upload.getCall(0).args[1] as any;
                if (testCase.S3_QUEUE_SIZE) {
                    expect(uploadArgPartConfig.queueSize).eq(Number(testCase.S3_QUEUE_SIZE));
                }
                if (testCase.S3_PART_SIZE_MB) {
                    expect(uploadArgPartConfig.partSize).eq(1024 * 1024 * Number(testCase.S3_PART_SIZE_MB));
                }
            });
        }
    });

    describe('isDataFile', () => {

        const sandbox: sinon.SinonSandbox = sinon.createSandbox();

        it('Should identify files correctly as data files', async () => {
            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const encoderStub = new DummyEncoder();
            const encoderSpy = sandbox.spy(encoderStub, 'encode');
            const s3Writer = new S3Writer('some_bucket/some_tenant_id', encoderStub, logger, stubAuthManager);

            const table = (s3Writer as any).isDataFile('ABCDEF');
            const metadata = (s3Writer as any).isDataFile('metadata');
            const manifest = (s3Writer as any).isDataFile('manifest.json');
            const ddl = (s3Writer as any).isDataFile('ddl');

            expect(table).to.be.true;
            expect(metadata).to.be.false;
            expect(manifest).to.be.false;
            expect(ddl).to.be.false;
        });
    });
});
