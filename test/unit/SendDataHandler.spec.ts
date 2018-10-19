
import 'reflect-metadata';
import * as chai from 'chai';
import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import SendDataMessage from '../../source/Messages/SendDataMessage';
import SendDataHandler from '../../source/MessageHandlers/SendDataHandler';
import IDataReader from '../../source/DataAccess/IDataReader';
import IDataWriter from '../../source/DataAccess/IDataWriter';
import * as sinon from 'sinon';
import { Logger } from 'winston';
import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';

const expect = chai.expect;

describe('SendDataHandler', () => {

    describe('when handling a message', () => {
        const integrationConfigFactory = sinon.createStubInstance(IntegrationConfigFactory);
        integrationConfigFactory.create.returns({
            queries: [
                'SELECT * FROM ALL_TABLES'
            ],
            type: 'Banner'
        });

        it('should successfully return after handling a message', async () => {
            const message: IMessage = SendDataMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const reader = container.get<IDataReader>(TYPES.DataReader);
            const writer = container.get<IDataWriter>(TYPES.DataWriter);

            const readerReadSpy = sinon.spy(reader, 'read');
            const writerSpy = sinon.spy(writer, 'ingest');

            const handler = new SendDataHandler(reader, writer, logger, integrationConfigFactory as any);
            await handler.handle(message);

            expect(readerReadSpy.callCount).to.eq(1);
            expect(writerSpy.callCount).to.eq(1);
        });
    });
});
