// tslint:disable:no-conditional-assignment
import 'reflect-metadata';
import * as chai from 'chai';
import * as AWS from 'aws-sdk-mock';

import { Readable } from 'stream';
import * as oracledb from 'oracledb';
import sinon = require('sinon');
import OracleReader from '../../source/DataAccess/Oracle/OracleReader';
import container from './test.inversify.config';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';

const expect = chai.expect;

describe('OracleReader', () => {
    describe('when previewing queries', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should log the queries', () => {
            const logger: Logger = container.get<Logger>(TYPES.Logger);

            const oracleReader: OracleReader = new OracleReader(logger);
            const spy = sandbox.spy(logger, 'info');

            oracleReader.logQueries();

            expect(spy.calledTwice).to.be.true;
        });
    });

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
            const executeFunc = async (query, binds, options) => {

                const resultStream = new Readable({objectMode: true });
                resultStream.push({ col1: 'value', col2: 'value'});
                resultStream.push(null);
                return Promise.resolve(resultStream);
            };
            const closeFunc = async () => {
                return Promise.resolve();
            };

            const executeSpy = sandbox.spy(executeFunc);
            const closeSpy = sandbox.spy(closeFunc);

            const getConnectionStub = sandbox.stub(oracledb, 'getConnection')
                .returns({ queryStream: executeSpy, close: closeSpy });

            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger);

            const readable: Readable = await oracleReader.read();

            expect(getConnectionStub.calledOnce).to.be.true;
            expect(executeSpy.calledOnce).to.be.true;
            expect(closeSpy.calledOnce).to.be.false;
            expect(readable).to.be.not.null;

            delete process.env.ORACLE_ENDPOINT;
        });

        it('should not attempt to connect to Oracle when generating demo data', async () => {
            const executeFunc = async (query, binds, options) => {
                const resultStream = new Readable({objectMode: true });
                resultStream.push({ col1: 'value', col2: 'value'});
                return Promise.resolve(resultStream);
            };
            const executeSpy = sandbox.spy(executeFunc);

            const stub = sandbox.stub(oracledb, 'getConnection').returns({ queryStream: executeSpy});
            const logger: Logger = container.get<Logger>(TYPES.Logger);
            const oracleReader: OracleReader = new OracleReader(logger);

            const readable: Readable = await oracleReader.read();

            expect(executeSpy.calledOnce).to.be.false;
            expect(stub.calledOnce).to.be.false;
            expect(readable).to.be.not.null;
        });
    });
});
