
import 'reflect-metadata';
import * as chai from 'chai';
import * as AWS from 'aws-sdk-mock';

import AdHocIngestCommand from '../../source/Commands/AdHocIngestCommand';
import SendDataMessage from '../../source/Messages/SendDataMessage';

const expect = chai.expect;

describe('AdHocIngestCommand', () => {

    describe('when invoked', () => {

        it('should create and send a SendData message to the queue', async () => {
            const queueUrl = 'someurl';

            const command: AdHocIngestCommand = new AdHocIngestCommand(queueUrl);
            let sendMessageCalls = 0;

            // The ability to pass a spy in as the stub seems to be broken, so we do it the hard way for now.
            AWS.mock('SQS', 'sendMessage', (params, callback) => {
                sendMessageCalls++;
                const expectedBody = SendDataMessage.create().toJson();
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
