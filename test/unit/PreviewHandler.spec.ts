
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

const expect = chai.expect;

describe('PreviewHandler', () => {

    describe('when handling a message', () => {

        it('should successfully return after handling a message', async () => {
            const message: IMessage = PreviewMessage.create({}, '1234');

            const logger = container.get<Logger>(TYPES.Logger);
            const reader = container.get<IDataReader>(TYPES.DataReader);

            const loggerSpy = sinon.spy(logger, 'log');
            const readerLogQuerySpy = sinon.spy(reader, 'logQueries');
            const readerReadSpy = sinon.spy(reader, 'read');

            const handler = new PreviewHandler(reader, logger);
            await handler.handle(message);

            expect(loggerSpy.callCount).to.be.greaterThan(1);
            expect(readerLogQuerySpy.callCount).to.eq(1);
            expect(readerReadSpy.callCount).to.eq(0);

        });
    });
});
