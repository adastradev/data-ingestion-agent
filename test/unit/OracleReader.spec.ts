import 'reflect-metadata';
import * as chai from 'chai';

import { Readable } from 'stream';
import sinon = require('sinon');
import { stubInterface } from 'ts-sinon';
import OracleReader from '../../source/DataAccess/Oracle/OracleReader';
import container from './test.inversify.config';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';

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
            const executeSpy = sandbox.spy(async (query, binds, options) => {
                const resultStream = new Readable({objectMode: true });
                resultStream.push({ col1: 'value', col2: 'value'});
                resultStream.push(null);
                return Promise.resolve(resultStream);
            });
            const closeSpy = sandbox.spy(async () => {
                return Promise.resolve();
            });

            // stub connection pool
            const releaseConnectionSpy = sandbox.spy(async (connection: any) => {
                await connection.close();
                return Promise.resolve();
            });
            const poolStub = stubInterface<IConnectionPool>({
                close: Promise.resolve(),
                getConnection: { close: closeSpy, queryStream: executeSpy },
                open: Promise.resolve()
            });
            const releaseStub = (poolStub.releaseConnection as sinon.SinonStub);
            releaseStub.callsFake(releaseConnectionSpy);

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);

            // expected use sequence for OracleReader
            await poolStub.open();

            const readable: Readable = await oracleReader.read('Mock query statement');
            await oracleReader.close();

            await poolStub.close();

            expect(executeSpy.calledOnce).to.be.true;
            expect(releaseConnectionSpy.calledOnce).to.be.true;
            expect(closeSpy.calledOnce).to.be.true;
            expect(readable).to.be.not.null;

            delete process.env.ORACLE_ENDPOINT;
        });

        it('should not attempt to connect to Oracle when generating demo data', async () => {
            const poolStub = stubInterface<IConnectionPool>();

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger, poolStub);
            const closeSpy = sandbox.spy(oracleReader, 'close');

            const readable: Readable = await oracleReader.read('Mock query statement');
            await oracleReader.close();
            expect(closeSpy.calledOnce).to.be.true;
            expect(readable).to.be.not.null;
        });
    });
});
