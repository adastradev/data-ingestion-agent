import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';
import { Container, inject, injectable } from 'inversify';

import TYPES from '../ioc.types';
import MessageHandlerFactory from './MessageHandlerFactory';
import IMessage from './IMessage';
import IMessageHandler from './IMessageHandler';
import MessageFactory from './MessageFactory';
import ICommand from './Commands/ICommand';
import { AuthManager } from './astra-sdk/AuthManager';
import sleep from './Util/sleep';
import * as v8 from 'v8';

enum AgentMode { 'ShutdownRequested', 'Listening', 'Adhoc' }

@injectable()
export default class Agent {

    private mode: AgentMode = AgentMode.Listening;

    constructor(
        @inject(TYPES.Logger) private readonly logger: Winston.Logger,
        @inject(TYPES.QueueUrl) private readonly queueUrl: string,
        @inject(TYPES.AuthManager) private readonly authManager: AuthManager,
        @inject(TYPES.Container) private readonly container: Container
    ) {
    }

    public async main() {
        process.on('SIGTERM', () => {
            this.mode = AgentMode.ShutdownRequested;
        });

        this.logHeapSpaceStats();
        await this.handleAgentCommands();

        this.logger.debug(`Process Id: ${process.pid}`);
        this.logger.debug('Waiting for ingestion commands');

        do {
            await sleep(1000);

            await this.authManager.refreshCognitoCredentials();

            const sqs = new SQS();
            // For now fetch 1 message from the queue but in the future we could open this up
            const result = await sqs.receiveMessage({ QueueUrl: this.queueUrl, MaxNumberOfMessages: 1}).promise();
            for (const msg of result.Messages) {
                await this.handleMessage(msg, sqs);
            }
        } while (this.mode === AgentMode.Listening);

        this.logger.debug('Stopped waiting for ingestion commands');
    }

    private async handleAgentCommands() {
        const args = process.argv.splice(2);
        if (args.length > 0) {
            let command: ICommand;
            command = this.container.get<ICommand>(TYPES[args[0].toUpperCase()]);
            await command.invoke(args.splice(1));

            this.mode = AgentMode.Adhoc;
        }
    }

    private async handleMessage(sqsMessage: SQS.Message, sqs: SQS) {
        let message: IMessage = null;
        let messageHandler: IMessageHandler;
        try {
            const handlerFactory = this.container.get<MessageHandlerFactory>(TYPES.MessageHandlerFactory);
            const messageFactory = this.container.get<MessageFactory>(TYPES.MessageFactory);

            message = messageFactory.createFromJson(sqsMessage.Body, sqsMessage.ReceiptHandle);

            this.logger.debug(`Acknowledging message: ${message.receiptHandle}`);
            await sqs.deleteMessage({ QueueUrl: this.queueUrl, ReceiptHandle: message.receiptHandle }).promise();

            this.logger.info(`${message.type} Message Received`);
            messageHandler = handlerFactory.getHandler(message);

            await messageHandler.handle(message);
        } catch (error) {
            this.logger.debug(`Acknowledging message: ${message.receiptHandle}`);
            await sqs.deleteMessage({ QueueUrl: this.queueUrl, ReceiptHandle: message.receiptHandle }).promise();
            this.logger.error(error.message);
        }
    }

    private logHeapSpaceStats() {
        const heapStats = v8.getHeapStatistics();
        this.logger.debug(JSON.stringify(heapStats));

        const heapSpaceStats: v8.HeapSpaceInfo[] = v8.getHeapSpaceStatistics();
        heapSpaceStats.forEach((heapSpaceInfo) => {
            this.logger.debug(JSON.stringify(heapSpaceInfo));
        });
    }
}
