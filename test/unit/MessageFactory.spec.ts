
import 'reflect-metadata';
import * as chai from 'chai';
import { Container } from 'inversify';
import startup from './test.inversify.config';
import TYPES from '../../ioc.types';

import SendDataMessage from '../../source/Messages/SendDataMessage';
import IMessage from '../../source/IMessage';
import MessageFactory from '../../source/MessageFactory';

const expect = chai.expect;

describe('MessageFactory', () => {

    describe('when creating a new message instance', () => {

        it('should return a properly configured message', () => {
            const message = SendDataMessage.create({}, '1234');
            const json = message.toJson();

            const mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            const createdMessage = mf.createFromJson(json);

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage).to.deep.eq(message);
        });

        it('should return a properly configured message when a message identifier is not specified', () => {
            const message = SendDataMessage.create();
            const json = message.toJson();

            const mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            const createdMessage = mf.createFromJson(json);

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage).to.deep.eq(message);
        });

        it('should return a properly configured message when a message identifier is not specified', () => {
            const message = SendDataMessage.create();
            const json = message.toJson();

            const mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            const createdMessage = mf.createFromJson(json, '1234');

            expect(createdMessage).to.be.instanceOf(SendDataMessage);
            expect(createdMessage.receiptHandle).to.eq('1234');
        });

        it('should fail when an invalid message type is specified', () => {
            const message = { type: 'DoesNotExist', version: '1' } as IMessage;
            const json = JSON.stringify(message);

            const mf = startup.get<MessageFactory>(TYPES.MessageFactory);
            expect(mf.createFromJson.bind(mf, json, '1234'))
                .to
                .throw('Unknown message type: DoesNotExist - (inner) Error: NULL argument');
        });

    });
});
