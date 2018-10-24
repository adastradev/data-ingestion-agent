import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';
import { Container } from 'inversify';
import startup from './inversify.config';
import TYPES from './ioc.types';
import MessageHandlerFactory from './source/MessageHandlerFactory';
import IMessage from './source/IMessage';
import IMessageHandler from './source/IMessageHandler';
import MessageFactory from './source/MessageFactory';
import ICommand from './source/Commands/ICommand';
import { AuthManager } from './source/astra-sdk/AuthManager';
import sleep from './source/Util/sleep';

let shutdownRequested = false;
process.on('SIGTERM', () => {
    shutdownRequested = true;
});

class App {

    public static async main() {
        this.container = await startup();

        this.logger = this.container.get<Winston.Logger>(TYPES.Logger);
        const queueUrl = this.container.get<string>(TYPES.QueueUrl);
        const authManager = this.container.get<AuthManager>(TYPES.AuthManager);
        const sqs = new SQS();
        let isAdhoc = false;

        // Handle agent commands
        const args = process.argv.splice(2);
        if (args.length > 0) {
            isAdhoc = true;
            let command: ICommand;
            command = this.container.get<ICommand>(TYPES[args[0].toUpperCase()]);
            await command.invoke(args.splice(1));
        }

        this.logger.silly(`Proccess Id: ${process.pid}`);
        this.logger.silly('Waiting for schedule event');
        while (!shutdownRequested) {
            await sleep(1000);

            await authManager.refreshCognitoCredentials();
            const result = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();

            if (result.Messages) {

                let message: IMessage = null;
                let messageHandler: IMessageHandler;
                try {
                    const handlerFactory = this.container.get<MessageHandlerFactory>(TYPES.MessageHandlerFactory);
                    const messageFactory = this.container.get<MessageFactory>(TYPES.MessageFactory);

                    message = messageFactory.createFromJson(result.Messages[0].Body, result.Messages[0].ReceiptHandle);

                    this.logger.info(`${message.type} Message Received`);
                    messageHandler = handlerFactory.getHandler(message);

                    // TODO: Async or block?
                    await messageHandler.handle(message);
                } catch (error) {
                    // TODO: Requeue/Dead-letter the message?
                    throw Error(error.message);
                } finally {
                    this.logger.silly(`Acknowledging message: ${message.receiptHandle}`);
                    await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: message.receiptHandle }).promise();
                }

                // Bail after completing adhoc requests
                if (isAdhoc) {
                    return;
                }
            }
        }
    }

    private static container: Container;
    private static logger: Winston.Logger = null;
}

App.main();
