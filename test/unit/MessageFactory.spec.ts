
import "reflect-metadata";
import * as chai from 'chai';
import { Container } from "inversify";
import startup from './test.inversify.config';
import TYPES from '../../ioc.types';

import SendDataMessage from '../../source/Messages/SendDataMessage';
import IMessage from '../../source/IMessage';
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

        // it('should return a properly configured message', () => {
        //     var val = "SendData";
        //     const message = startup.get<IMessage>(TYPES[`${val}Message`]);

        //     expect(message).to.not.be.null;
        // });

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

        it('should fail when an invalid message type is specified', () => {
            const message = <IMessage> { type: "DoesNotExist", version: "1" };
            let json = JSON.stringify(message);

            var mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            expect(mf.createFromJson.bind(mf, json, "1234")).to.throw('Unknown message type: DoesNotExist - (inner) Error: NULL argument');
        });

    });
});
