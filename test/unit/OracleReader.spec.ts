import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { Readable } from 'stream';
import sinon = require('sinon');
import { stubInterface } from 'ts-sinon';
import OracleReader from '../../source/DataAccess/Oracle/OracleReader';
import container from './test.inversify.config';
import { Logger, query } from 'winston';
import TYPES from '../../ioc.types';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import { IQueryResult } from '../../source/DataAccess/IDataReader';
import { TableNotFoundException } from '../../source/TableNotFoundException';

const expect = chai.expect;

describe('OracleReader', () => {
    describe('when ingesting data', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should return a stream representing the dataset', async () => {
            process.env.ORACLE_ENDPOINT = 'something';

            // stub connection
            const queryStreamSpy = sandbox.spy(async () => {
                const resultStream = new Readable({objectMode: true });
                resultStream.push({ col1: 'value', col2: 'value'});
                resultStream.push(null);

                return Promise.resolve(resultStream);
            });
            const closeConnectionSpy = sandbox.spy(async () => {
                return Promise.resolve();
            });

            // stub connection pool
            const mockPool = stubInterface<IConnectionPool>();
            const getConnectionStub = (mockPool.getConnection as sinon.SinonStub);
            getConnectionStub.returns({ close: closeConnectionSpy, queryStream: queryStreamSpy });
            const releaseConnectionStub = (mockPool.releaseConnection as sinon.SinonStub);
            releaseConnectionStub.callsFake(sandbox.spy(async (connection: any) => {
                await connection.close();
                return Promise.resolve();
            }));

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, mockPool);

            const readerSubscribeStub = sinon.stub(oracleReader, 'subscribeToStreamEvents' as any);
            (readerSubscribeStub as sinon.SinonStub).callsFake(sandbox.spy(async (args) => {
                const metadataStream = new Readable({objectMode: true });
                metadataStream.push({ name: 'SOME_COLUMN', dbType: 2});
                metadataStream.push(null);
                // pass through the input stream without transforming; add mock metadata stream
                return Promise.resolve({ result: args[0], metadata: metadataStream });
            }));

            // expected use sequence for OracleReader
            await mockPool.open();

            const queryResult: IQueryResult = await oracleReader.read('Mock query statement');
            await oracleReader.close();

            await mockPool.close();

            expect(getConnectionStub.calledOnce).to.be.true;
            expect(queryStreamSpy.calledOnce).to.be.true;
            expect(releaseConnectionStub.calledOnce).to.be.true;
            expect(closeConnectionSpy.calledOnce).to.be.true;
            expect(queryResult).to.be.not.null;

            delete process.env.ORACLE_ENDPOINT;
        });

        it('should not attempt to connect to Oracle when generating demo data', async () => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);
            const closeSpy = sandbox.spy(oracleReader, 'close');

            const queryResult: IQueryResult = await oracleReader.read('Mock query statement');
            await oracleReader.close();
            expect(closeSpy.calledOnce).to.be.true;
            expect(queryResult.result).to.be.not.null;
        });

        it('should transform the stream into json as the result stream', (done) => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);
            const queryStream = new Readable({objectMode: true});
            const queryObj = { COL1: 'value' };

            const transformedStream: Readable = (oracleReader as any).getTransformStream(queryStream);
            queryStream.push(JSON.stringify(queryObj));
            queryStream.push(null);
            let results = '';
            // tslint:disable-next-line:no-conditional-assignment
            transformedStream.on('data', (data: Buffer) => {
                results += data.toString();
            });

            transformedStream.on('end', () => {
                expect(results).to.equal('"{\\"COL1\\":\\"value\\"}"\n');
                done();
            });
        });

        it('should return metadata as a readable stream', (done) => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);
            const queryStream = new Readable({objectMode: true});

            const metadataObject = {TABLE1: { name: 'COL1' }};
            const metadataStream: Readable =
                (oracleReader as any).getMetadataAsStream([ metadataObject ]);

            const result = [];
            metadataStream.on('data', (data: Buffer) => {
                result.push(data);
            });
            metadataStream.on('end', () => {
                expect(result[0]).to.deep.equal(metadataObject);
                done();
            });
        });

        it('should subscribe to query stream events to fetch metadata', (done) => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);

            const getMetadataStreamStub = (sandbox.stub(oracleReader, 'getMetadataAsStream' as any) as sinon.SinonStub).returns({});
            const getTransformStreamStub = (sandbox.stub(oracleReader, 'getTransformStream' as any) as sinon.SinonStub).returns({});

            const queryStream = new Readable({objectMode: true});

            const queryObj = { COL1: 'value' };
            queryStream.push(JSON.stringify(queryObj));
            queryStream.push(null);
            ((oracleReader as any)
                .subscribeToStreamEvents(queryStream, 'some statement') as Promise<IQueryResult>)
                .then((queryResult: IQueryResult) => {
                    expect(getMetadataStreamStub.calledOnce).to.be.true;
                    expect(getTransformStreamStub.calledOnce).to.be.true;
                    done();
                });

            (queryStream as any).emit('metadata', {});
        });

        it('should reject the query when an unhandled failure is reported', async () => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);

            (sandbox.stub(oracleReader, 'getMetadataAsStream' as any) as sinon.SinonStub).returns({});
            (sandbox.stub(oracleReader, 'getTransformStream' as any) as sinon.SinonStub).returns({});

            const queryStream = new Readable({objectMode: true});

            expect(
                ((oracleReader as any).subscribeToStreamEvents(queryStream, 'some statement') as Promise<IQueryResult>))
                    .to.eventually.be
                    .rejectedWith(Error);

            (queryStream as any).emit('error', new Error('Something failed'));
        });

        it('should reject the query when a table not found error occurs', async () => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);

            (sandbox.stub(oracleReader, 'getMetadataAsStream' as any) as sinon.SinonStub).returns({});
            (sandbox.stub(oracleReader, 'getTransformStream' as any) as sinon.SinonStub).returns({});

            const queryStream = new Readable({objectMode: true});

            expect(
                ((oracleReader as any).subscribeToStreamEvents(queryStream, 'some statement') as Promise<IQueryResult>))
                    .to.eventually.be
                    .rejectedWith(TableNotFoundException);

            (queryStream as any).emit('error', { errorNum: 942 });
        });
    });
});
