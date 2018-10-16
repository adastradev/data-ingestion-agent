
import "reflect-metadata";
import * as chai from 'chai';
import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import SendDataMessage from "../../source/Messages/SendDataMessage";
import SendDataHandler from "../../source/MessageHandlers/SendDataHandler";
import IDataReader from "../../source/DataAccess/IDataReader";
import IDataWriter from "../../source/DataAccess/IDataWriter";
import * as sinon from "sinon";
import { Logger } from "winston";

const expect = chai.expect;

describe('SendDataHandler', () => {

    describe('when handling a message', () => {

        it('should successfully return after handling a message', async () => {
            const message: IMessage = SendDataMessage.create({}, "1234");

            var logger = container.get<Logger>(TYPES.Logger);
            var reader = container.get<IDataReader>(TYPES.DataReader);
            var writer = container.get<IDataWriter>(TYPES.DataWriter);

            var readerLogQuerySpy = sinon.spy(reader, "logQueries");
            var readerReadSpy = sinon.spy(reader, "read");
            var writerSpy = sinon.spy(writer, "ingest");

            var handler = new SendDataHandler(reader, writer, logger);
            await handler.handle(message);

            expect(readerLogQuerySpy.callCount).to.eq(0);
            expect(readerReadSpy.callCount).to.eq(1);
            expect(writerSpy.callCount).to.eq(1);
        });
    });
});
