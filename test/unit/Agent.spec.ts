
import 'reflect-metadata';
import * as v8 from 'v8';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import * as sinon from 'sinon';

import container from './test.inversify.config';
import { Agent, AgentMode } from '../../source/Agent';
import ICommand from '../../source/Commands/ICommand';
import TYPES from '../../ioc.types';
import { InvalidCommandException } from '../../source/InvalidCommandException';
import winston = require('winston');
import { AuthManager } from '../../source/Auth';
import { SQS } from 'aws-sdk';
import PreviewMessage from '../../source/Messages/PreviewMessage';
import { create } from 'domain';
import DummyMessage from '../../source/Messages/DummyMessage';
import MessageHandlerFactory from '../../source/MessageHandlerFactory';
import MessageFactory from '../../source/MessageFactory';
import DummyHandler from '../../source/MessageHandlers/DummyHandler';

const expect = chai.expect;

describe('Agent', () => {

    describe('handleAgentCommands', () => {
        let sandbox: sinon.SinonSandbox;
        let dummyCommand: DummyCommand;
        const args: string[] = [];

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            dummyCommand = new DummyCommand();
            container.bind<ICommand>(TYPES.PREVIEW).toConstantValue(dummyCommand);
            args.push(...process.argv);
            process.argv = [];
        });

        afterEach(() => {
            sandbox.reset();
            container.unbind(TYPES.PREVIEW);
            process.argv.push(...args);
        });

        it('should invoke the command then set agent mode to Adhoc when a command was specified by the caller', async () => {
            process.argv.push('node');
            process.argv.push('somefile.js');
            process.argv.push('preview');

            const invokeSpy = sandbox.spy(dummyCommand, 'invoke');

            const agent = new Agent(null, 'somequeueurl', null, container, null);
            await (agent as any).handleAgentCommands();

            expect(invokeSpy.calledOnce).to.be.true;
            expect((agent as any).mode).to.equal(AgentMode.Adhoc);
        });

        it('should throw exception for invalid command when the specified command is not known', async () => {
            process.argv.push('node');
            process.argv.push('somefile.js');
            process.argv.push('doesnotexist');

            const invokeSpy = sandbox.spy(dummyCommand, 'invoke');

            const agent = new Agent(null, 'somequeueurl', null, container, null);

            expect((agent as any).handleAgentCommands()).to.eventually.be.rejectedWith(InvalidCommandException);
        });
    });

    describe('logHeapSpaceStats', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.reset();
        });

        it('should attempt to log heap statistics', async () => {
            const getHeapStatsSpy = sinon.spy(v8, 'getHeapStatistics');
            const getHeapSpaceStatsSpy = sinon.spy(v8, 'getHeapSpaceStatistics');
            const logger = container.get<winston.Logger>(TYPES.Logger);
            const agent = new Agent(logger, 'somequeueurl', null, container, null);

            const loggerSpy = sandbox.spy(logger, 'debug');

            (agent as any).logHeapSpaceStats();

            expect(getHeapStatsSpy.calledOnce).to.be.true;
            expect(getHeapSpaceStatsSpy.calledOnce).to.be.true;
            expect(loggerSpy.callCount).to.be.approximately(7, 5, 'Expected logger.debug call count is outside the bounds of the acceptable range');
        });
    });

    describe('main', () => {
        let sandbox: sinon.SinonSandbox;

        const createTestContext = () => {
            const logger = container.get<winston.Logger>(TYPES.Logger);
            const authManager = container.get<AuthManager>(TYPES.AuthManager);
            const sqs = new SQS();
            const agent = new Agent(logger, 'somequeueurl', authManager, container, sqs);
            const logHeapSpaceStatsStub = sandbox.stub(agent as any, 'logHeapSpaceStats');
            const refreshCognitoStub = sandbox.stub(authManager, 'refreshCognitoCredentials');
            const handleMessageStub = sandbox.stub(agent, 'handleMessage' as any);
            const handleAgentCmdsStub = sandbox.stub(agent, 'handleAgentCommands' as any);

            return {
                logger,
                authManager,
                sqs,
                agent,
                logHeapSpaceStatsStub,
                refreshCognitoStub,
                handleMessageStub,
                handleAgentCmdsStub
            };
        };

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.reset();
        });

        it('should attempt to authenticate and then handle a message before exiting when set to Adhoc mode', async () => {
            const ctx = createTestContext();
            (ctx.agent as any).mode = AgentMode.Adhoc;
            const dummyPreviewMsg = {
                Messages: [ new PreviewMessage() ]
            };

            const sqsReceiveMsgStub = (sandbox.stub(ctx.sqs, 'receiveMessage') as sinon.SinonStub).returns({ promise: () => Promise.resolve(dummyPreviewMsg)});

            await ctx.agent.main();

            expect(ctx.logHeapSpaceStatsStub.calledOnce).to.be.true;
            expect(ctx.refreshCognitoStub.calledOnce).to.be.true;
            expect(ctx.handleMessageStub.calledOnce).to.be.true;
            expect(ctx.handleAgentCmdsStub.calledOnce).to.be.true;
            expect(sqsReceiveMsgStub.calledOnce).to.be.true;
            expect(ctx.handleMessageStub.firstCall.args[0]).to.deep.equal(dummyPreviewMsg.Messages[0]);
        });

        it('should attempt to authenticate and then handle a message before exiting when a shutdown is requested via SIGTERM', async () => {
            const ctx = createTestContext();
            const dummyPreviewMsg = {
                Messages: [ new PreviewMessage() ]
            };

            const sqsReceiveMsgStub = (sandbox.stub(ctx.sqs, 'receiveMessage') as sinon.SinonStub).returns({ promise: () => Promise.resolve(dummyPreviewMsg)});

            const mainResult = ctx.agent.main();
            (process as any).emit('SIGTERM', {});
            await mainResult;

            expect((ctx.agent as any).mode).to.equal(AgentMode.ShutdownRequested);
            expect(ctx.logHeapSpaceStatsStub.calledOnce).to.be.true;
            expect(ctx.refreshCognitoStub.calledOnce).to.be.true;
            expect(ctx.handleMessageStub.calledOnce).to.be.true;
            expect(ctx.handleAgentCmdsStub.calledOnce).to.be.true;
            expect(sqsReceiveMsgStub.calledOnce).to.be.true;
            expect(ctx.handleMessageStub.firstCall.args[0]).to.deep.equal(dummyPreviewMsg.Messages[0]);
        });
    });

    describe('handleMessage', () => {
        let sandbox: sinon.SinonSandbox;

        const createTestContext = () => {
            const logger = container.get<winston.Logger>(TYPES.Logger);
            const authManager = container.get<AuthManager>(TYPES.AuthManager);
            const sqs = new SQS();
            const deleteMessageStub = (sandbox.stub(sqs, 'deleteMessage') as sinon.SinonStub).returns({ promise: () => Promise.resolve()});
            const dummyHandler = new DummyHandler();
            const handleMessageSpy = sandbox.spy(dummyHandler, 'handle');
            const messageHandlerFactory = new MessageHandlerFactory(container);
            const getHandlerStub = sandbox.stub(messageHandlerFactory, 'getHandler').returns(dummyHandler);
            const messageFactory = new MessageFactory(container, logger);
            const dummyMessage = DummyMessage.create('msg', 'abc');
            const createFromJsonStub = sandbox.stub(messageFactory, 'createFromJson').returns(dummyMessage);

            return {
                logger,
                authManager,
                sqs,
                deleteMessageStub,
                dummyHandler,
                handleMessageSpy,
                messageHandlerFactory,
                getHandlerStub,
                messageFactory,
                dummyMessage,
                createFromJsonStub
            };
        };

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.reset();
        });

        it('should call a handler and ackwnowledge the message', async () => {
            const ctx = createTestContext();

            const agent = new Agent(ctx.logger, 'somequeueurl', ctx.authManager, container, ctx.sqs);

            const message = {
                Body: JSON.stringify(new DummyMessage()),
                ReceiptHandle: 'abc123'
            };

            await (agent as any).handleMessage(message, ctx.sqs, ctx.messageHandlerFactory, ctx.messageFactory);

            expect(ctx.createFromJsonStub.calledOnce).to.be.true;
            expect(ctx.deleteMessageStub.calledOnce).to.be.true;
            expect(ctx.getHandlerStub.calledOnce).to.be.true;
            expect(ctx.handleMessageSpy.calledOnce).to.be.true;
        });

        it('should not acknowledge the message when an error occurs parsing the message body', async () => {
            const ctx = createTestContext();
            (ctx.messageFactory.createFromJson as any).restore();
            const createFromJsonStub = sandbox.stub(ctx.messageFactory, 'createFromJson').throws(new Error('Some failure'));

            const agent = new Agent(ctx.logger, 'somequeueurl', ctx.authManager, container, ctx.sqs);

            const message = {
                Body: JSON.stringify(new DummyMessage()),
                ReceiptHandle: 'abc123'
            };

            // Can't parse the message so we can't delete a message we have no receipt handle for
            await (agent as any).handleMessage(message, ctx.sqs, ctx.messageHandlerFactory, ctx.messageFactory);

            expect(createFromJsonStub.calledOnce).to.be.true;
            expect(ctx.deleteMessageStub.notCalled).to.be.true;
            expect(ctx.getHandlerStub.notCalled).to.be.true;
            expect(ctx.handleMessageSpy.notCalled).to.be.true;
        });

        it('should attempt to delete a message if after parsing it fails', async () => {
            const ctx = createTestContext();
            (ctx.deleteMessageStub as sinon.SinonStub)
                .onFirstCall()
                    .returns({ promise: () => Promise.reject(Error)})
                .onSecondCall()
                    .returns({ promise: () => Promise.resolve()});
            const agent = new Agent(ctx.logger, 'somequeueurl', ctx.authManager, container, ctx.sqs);

            const message = {
                Body: JSON.stringify(new DummyMessage()),
                ReceiptHandle: 'abc123'
            };

            // Can't parse the message so we can't delete a message we have no receipt handle for
            await (agent as any).handleMessage(message, ctx.sqs, ctx.messageHandlerFactory, ctx.messageFactory);

            expect(ctx.createFromJsonStub.calledOnce).to.be.true;
            expect(ctx.deleteMessageStub.calledTwice).to.be.true;
            expect(ctx.getHandlerStub.notCalled).to.be.true;
            expect(ctx.handleMessageSpy.notCalled).to.be.true;
        });

    });
});

class DummyCommand implements ICommand {
    public async invoke(args: string[]) {
        return Promise.resolve();
    }
}
