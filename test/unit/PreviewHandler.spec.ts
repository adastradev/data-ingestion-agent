
import 'reflect-metadata';
import * as chai from 'chai';
import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import IDataReader from '../../source/DataAccess/IDataReader';
import * as sinon from 'sinon';
import { Logger } from 'winston';
import PreviewMessage from '../../source/Messages/PreviewMessage';
import PreviewHandler from '../../source/MessageHandlers/PreviewHandler';
import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';

const expect = chai.expect;

describe('PreviewHandler', () => {

    describe('when handling a preview message', () => {
        const integrationConfigFactory = sinon.createStubInstance(IntegrationConfigFactory);
        integrationConfigFactory.create.returns({
            queries: [
                'SELECT * FROM ALL_TABLES'
            ],
            type: 'Banner'
        });

        it('should successfully return after handling a message', async () => {
            const message: IMessage = PreviewMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const loggerInfoSpy = sinon.spy(logger, 'info');

            const reader = container.get<IDataReader>(TYPES.DataReader);
            const readerReadSpy = sinon.spy(reader, 'read');

            const handler = new PreviewHandler(reader, logger, integrationConfigFactory as any);
            const logQuerySpy = sinon.spy(handler, 'logQueries');
            await handler.handle(message);

            expect(logQuerySpy.callCount).to.eq(1);
            expect(readerReadSpy.callCount).to.eq(0);
            expect(loggerInfoSpy.calledTwice).to.be.true;
        });
    });
});
