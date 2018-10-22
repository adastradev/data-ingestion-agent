
import 'reflect-metadata';
import * as chai from 'chai';
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

const expect = chai.expect;

describe('SendDataHandler', () => {

    describe('when handling a message', () => {
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
            const pool = container.get<IConnectionPool>(TYPES.ConnectionPool);

            const handler = new SendDataHandler(writer, logger, integrationConfigFactory as any, pool, container);
            const getStatementExecutorSpy = sinon.spy(handler, 'getStatementExecutor' as any);
            await handler.handle(message);

            expect(getStatementExecutorSpy.callCount).to.eq(1);
            expect((writer.ingest as sinon.SinonStub).callCount).to.eq(1);
        });
    });
});
