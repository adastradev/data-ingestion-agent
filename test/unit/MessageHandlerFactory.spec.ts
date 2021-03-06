import 'reflect-metadata';
import * as chai from 'chai';
import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import MessageHandlerFactory from '../../source/MessageHandlerFactory';
import DummyMessage from '../../source/Messages/DummyMessage';
import DummyHandler from '../../source/MessageHandlers/DummyHandler';

const expect = chai.expect;

describe('MessageHandlerFactory', () => {

    describe('when creating a new message handler instance', () => {

        it('should return a properly configured message handler', () => {
            const message = DummyMessage.create('stuff', '1234') as IMessage;

            const mhf = container.get<MessageHandlerFactory>(TYPES.MessageHandlerFactory);
            const handler = mhf.getHandler(message);

            expect(handler).to.be.instanceOf(DummyHandler);
        });

        it('should fail when an invalid message type is specified', () => {
            const message = { type: 'DoesNotExist', version: '1' } as IMessage;

            const mhf = container.get<MessageHandlerFactory>(TYPES.MessageHandlerFactory);

            expect(mhf.getHandler.bind(mhf, message))
                .to
                .throw('Unknown message handler type: DoesNotExist - (inner) Error: NULL argument');
        });
    });
});
