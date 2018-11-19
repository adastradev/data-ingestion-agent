
import 'reflect-metadata';
import * as chai from 'chai';
import sinon = require('sinon');
import { stubInterface } from 'ts-sinon';
import { Logger } from 'winston';
import TYPES from '../../ioc.types';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import container from './test.inversify.config';
import * as oracledb from 'oracledb';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import OracleConnectionPoolProxy from '../../source/DataAccess/Oracle/OracleConnectionPoolProxy';

const expect = chai.expect;

describe('OracleConnectionPoolProxy', () => {

    describe('open', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
            delete process.env.ORACLE_ENDPOINT;
            delete process.env.ORACLE_PASSWORD;
            delete process.env.ORACLE_USER;
        });

        it('should attempt to create a connection pool', async () => {
            const createPoolStub = sandbox.stub(oracledb, 'createPool');
            process.env.ORACLE_ENDPOINT = 'someendpoint';
            process.env.ORACLE_PASSWORD = 'somepwd';
            process.env.ORACLE_USER = 'somepwd';

            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));
            await poolProxy.open();

            expect(createPoolStub.calledOnce).to.be.true;
        });

        it('should not attempt to create a connection pool if the configured oracle endpoint is not specified', async () => {
            const createPoolStub = sandbox.stub(oracledb, 'createPool');

            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));
            await poolProxy.open();

            expect(createPoolStub.notCalled).to.be.true;
        });
    });

    describe('close', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should attempt to close the connection pool with the default drain time', async () => {
            const stubConnectionPool = {
                close: async (drainTime: number) => {
                    return Promise.resolve();
                }
            };
            const closeStub = sandbox.spy(stubConnectionPool, 'close');

            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));
            (poolProxy as any)._connectionPool = stubConnectionPool;
            await poolProxy.close();

            expect(closeStub.calledOnce).to.be.true;
            expect(closeStub.getCall(0).args[0]).to.equal(30);
        });

        it('should reject with an error if there is a failure to close the pool', async () => {
            const stubConnectionPool = {
                close: async (drainTime: number) => {
                    return Promise.reject(new Error('Some failure'));
                }
            };

            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));
            (poolProxy as any)._connectionPool = stubConnectionPool;

            expect(poolProxy.close()).to.eventually.be.rejectedWith(Error, 'Some failure');
        });
    });

    describe('getConnection', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should return a connection from the underlying connection pool', async () => {
            const stubConnection = {};
            const stubConnectionPool = {
                getConnection: async () => {
                    return Promise.resolve(stubConnection);
                }
            };
            const getConnectionStub = sandbox.spy(stubConnectionPool, 'getConnection');

            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));
            (poolProxy as any)._connectionPool = stubConnectionPool;
            const connection = await poolProxy.getConnection();

            expect(getConnectionStub.calledOnce).to.be.true;
            expect(connection).to.equal(stubConnection);
        });
    });

    describe('releaseConnection', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should attempt to close the specified connection', async () => {
            const stubConnection = {
                close: async () => {
                    return;
                }
            };

            const closeSpy = sandbox.spy(stubConnection, 'close');
            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));

            await poolProxy.releaseConnection(stubConnection);

            expect(closeSpy.calledOnce).to.be.true;
        });

        it('should reject with an error if there is a failure to close the connection', async () => {
            const stubConnection = {
                close: async () => {
                    return Promise.reject(new Error('Some failure'));
                }
            };

            const closeSpy = sandbox.spy(stubConnection, 'close');
            const poolProxy = new OracleConnectionPoolProxy(container.get<Logger>(TYPES.Logger));

            expect(poolProxy.releaseConnection(stubConnection)).to.eventually.be.rejectedWith(Error, 'Some failure');
        });
    });
});
