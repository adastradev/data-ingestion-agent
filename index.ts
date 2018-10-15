import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';
import { Container } from 'inversify';
import startup from './inversify.config';
import TYPES from './ioc.types';
import MessageHandlerFactory from './source/MessageHandlerFactory';
import IMessage from './source/IMessage';
import IMessageHandler from './source/IMessageHandler';
import MessageFactory from './source/MessageFactory';
import SendDataMessage from './source/Messages/SendDataMessage';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

var shutdownRequested = false;
process.on('SIGTERM', function() {
    shutdownRequested = true;
});

class Startup {

    private static container: Container; 
    private static logger: Winston.Logger = null;

    public static async initiatePreview(sqs: SQS, queueUrl: string): Promise<void> {
        var sendDataWithPreview = SendDataMessage.create({ preview: true });
        await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: sendDataWithPreview.toJson()}).promise();
    }

    public static async main() {

        this.container = await startup();

        this.logger = this.container.get<Winston.Logger>(TYPES.Logger);
        let queueUrl = this.container.get<string>(TYPES.QueueUrl);
        var sqsConfig = this.container.get<SQS.ClientConfiguration>(TYPES.SQSConfig);

        var sqs = new SQS(sqsConfig);

        // Handle args
        var args = process.argv.splice(2);
        if (args.length > 0) {
            if (args[0] === "preview") {
                await Startup.initiatePreview(sqs, queueUrl);
            }
        }

        this.logger.log('info', 'Waiting for sqs schedule event');
        var handlerFactory = this.container.get<MessageHandlerFactory>(TYPES.MessageHandlerFactory);
        var messageFactory = this.container.get<MessageFactory>(TYPES.MessageFactory);
        while(!shutdownRequested) {
            await sleep(1000);
            
            var result = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();

            if (result.Messages) {
                this.logger.log('info', `Message Received`);      

                var message: IMessage = null;
                var messageHandler: IMessageHandler;
                try {

                    message = messageFactory.createFromJson(result.Messages[0].Body, result.Messages[0].ReceiptHandle);
                    messageHandler = handlerFactory.getHandler(message);
                    
                    // TODO: Async or block?
                    await messageHandler.handle(message);                    
                }
                catch(error) {
                    // TODO: Dead-letter the message?
                    throw Error(error.message);
                }
                finally {                   
                    console.log(`Acknowledging message: ${message.receiptHandle}`);                        
                    await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: message.receiptHandle }).promise();
                }

                // Bail early on preview
                var preview: boolean = false;
                if (message && message.payload.preview) {
                    preview = message.payload.preview;
                }

                if (preview) {
                    return;
                }
            }
        }
    }
}


Startup.main();