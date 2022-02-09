
import 'reflect-metadata';
import container from './test.inversify.config';
import TYPES from '../../ioc.types';
import * as chai from 'chai';
import * as AWS from 'aws-sdk-mock';

import AdHocPreviewCommand from '../../source/Commands/AdHocPreviewCommand';
import PreviewMessage from '../../source/Messages/PreviewMessage';
import { Logger } from 'winston';

const expect = chai.expect;

describe('AdHocPreviewCommand', () => {

    describe('when invoked', () => {

        it('should create and send a Preview message to the queue', async () => {
            const queueUrl = 'someurl';
            const logger = container.get<Logger>(TYPES.Logger);
            const command: AdHocPreviewCommand = new AdHocPreviewCommand('someurl', logger);
            let sendMessageCalls = 0;

            // The ability to pass a spy in as the stub seems to be broken, so we do it the hard way for now.
            AWS.mock('SQS', 'sendMessage', (params, callback) => {
                sendMessageCalls++;
                const expectedBody = PreviewMessage.create().toJson();
                expect(params.MessageBody).to.eq(expectedBody);
                expect(params.QueueUrl).to.eq(queueUrl);
                callback(null, 'success');
            });

            await command.invoke();

            AWS.restore('SQS', 'sendMessage');

            expect(sendMessageCalls).to.eq(1);
        });
    });
});
