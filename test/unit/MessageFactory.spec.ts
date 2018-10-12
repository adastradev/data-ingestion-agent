
import "reflect-metadata";
import * as chai from 'chai';
import SendDataMessage from '../../source/Messages/SendDataMessage';
import IMessage from '../../source/IMessage';
import { Container } from "inversify";
import startup from './test.inversify.config';
import TYPES from '../../ioc.types';
import MessageFactory from "../../source/MessageFactory";

const expect = chai.expect;

describe('MessageFactory', () => {

    describe('when creating a new message instance', () => {

        it('should return a properly configured message', () => {
            const message = SendDataMessage.create({ preview: true }, "1234");
            let json = message.toJson();

            var mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            var createdMessage = mf.createFromJson(json);

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage).to.deep.eq(message);
        });

        it('should return a properly configured message when a message identifier is not specified', () => {
            const message = SendDataMessage.create({ preview: true });
            let json = message.toJson();

            var mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            var createdMessage = mf.createFromJson(json);

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage).to.deep.eq(message);
        });

        it('should return a properly configured message when a message identifier is not specified', () => {
            const message = SendDataMessage.create({ preview: true });
            let json = message.toJson();

            var mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            var createdMessage = mf.createFromJson(json, "1234");

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage.payload.preview).to.be.true;
            expect(createdMessage.receiptHandle).to.eq("1234");
        });
        
    });
});
