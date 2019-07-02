
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import SendDataMessage from '../../source/Messages/SendDataMessage';
import SendDataHandler from '../../source/MessageHandlers/SendDataHandler';
import IDataWriter from '../../source/DataAccess/IDataWriter';
import * as sinon from 'sinon';
import { Logger } from 'winston';
import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import { TableNotFoundException } from '../../source/TableNotFoundException';

const expect = chai.expect;

describe('SendDataHandler', () => {

    describe('when handling a message', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const integrationConfigFactory = sinon.createStubInstance(IntegrationConfigFactory);
        integrationConfigFactory.create.returns({
            queries: [
                { name: 'all_tables', query: 'SELECT * FROM ALL_TABLES' }
            ],
            type: 'Banner'
        });

        it('should successfully return after handling a message', async () => {
            const message: IMessage = SendDataMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const writer = container.get<IDataWriter>(TYPES.DataWriter);
            const tableAssociations: Array<[string, string]> = [];
            const stubConnection = {
                execute: async () => Promise.resolve({ rows: tableAssociations })
            };
            const pool: IConnectionPool = {
                open: async () => Promise.resolve(),
                close: async () => Promise.resolve(),
                getConnection: async () => Promise.resolve(stubConnection),
                releaseConnection: async () => Promise.resolve()
            };
            const oracleDDLHelper = new OracleDDLHelper(pool);

            const handler = new SendDataHandler(writer, logger, integrationConfigFactory as any, pool, container, null, null, null, oracleDDLHelper, 'test');

            const raiseCompletionStub = sandbox.stub(handler, 'raiseSnapshotCompletionEvent' as any);

            await handler.handle(message);

            expect((writer.ingest as sinon.SinonStub).callCount).to.eq(3);
            expect(raiseCompletionStub.calledOnce).to.be.true;
        });

        it('should fail to handle a message when ingestion failures occur', async () => {
            const message: IMessage = SendDataMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const writer = container.get<IDataWriter>(TYPES.DataWriter);

            (writer.ingest as sinon.SinonStub).reset();
            (writer.ingest as sinon.SinonStub).onFirstCall().rejects(new Error('Failure to ingest'));
            const tableAssociations: Array<[string, string]> = [];
            const stubConnection = {
                execute: async () => Promise.resolve({ rows: tableAssociations })
            };
            const pool: IConnectionPool = {
                open: async () => Promise.resolve(),
                close: async () => Promise.resolve(),
                getConnection: async () => Promise.resolve(stubConnection),
                releaseConnection: async () => Promise.resolve()
            };
            const oracleDDLHelper = new OracleDDLHelper(pool);

            const handler = new SendDataHandler(writer, logger, integrationConfigFactory as any, pool, container, null, null, null, oracleDDLHelper, 'test');

            expect(handler.handle(message)).to.eventually.be.rejectedWith(Error, 'Failure to ingest');
        });

        it('should not fail to handle a message when a table is not found', async () => {
            const message: IMessage = SendDataMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const writer = container.get<IDataWriter>(TYPES.DataWriter);
            (writer.ingest as sinon.SinonStub).reset();
            (writer.ingest as sinon.SinonStub)
                .onFirstCall()
                    .rejects(new TableNotFoundException('somequery', 'somequery table not found'))
                .onSecondCall()
                    .resolves()
                .onThirdCall()
                    .resolves();
            const tableAssociations: Array<[string, string]> = [];
            const stubConnection = {
                execute: async () => Promise.resolve({ rows: tableAssociations })
            };
            const pool: IConnectionPool = {
                open: async () => Promise.resolve(),
                close: async () => Promise.resolve(),
                getConnection: async () => Promise.resolve(stubConnection),
                releaseConnection: async () => Promise.resolve()
            };
            const oracleDDLHelper = new OracleDDLHelper(pool);

            const handler = new SendDataHandler(writer, logger, integrationConfigFactory as any, pool, container, null, null, null, oracleDDLHelper, 'test');
            const raiseCompletionStub = sandbox.stub(handler, 'raiseSnapshotCompletionEvent' as any);

            await handler.handle(message);

            expect((writer.ingest as sinon.SinonStub).callCount).to.eq(3);
            expect(raiseCompletionStub.calledOnce).to.be.true;
        });
    });
});
