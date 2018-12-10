
import 'reflect-metadata';
import * as chai from 'chai';
import DurationLogger from '../../source/Util/DurationLogger';
import sleep from '../../source/Util/sleep';
import * as sinon from 'sinon';
import * as winston from 'winston';

const expect = chai.expect;

describe('DurationLogger', () => {

    describe('when logging the duration of an operation', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.reset();
        });

        it('should log a properly configured message', async () => {
            const logger = winston.createLogger({});
            const loggerSpy = sandbox.spy(logger, 'log');

            const durationLogger = new DurationLogger(logger);

            durationLogger.start(`Took ${DurationLogger.DURATION_TOKEN}`);
            await sleep(50);
            durationLogger.stop();

            expect(loggerSpy.calledOnce).to.be.true;
            expect(loggerSpy.getCall(0).args[0].message).to.not.equal(`Took ${DurationLogger.DURATION_TOKEN}`);
        });

        it('should log a properly configured message for multiple operations', async () => {
            const logger = winston.createLogger({});
            const loggerSpy = sandbox.spy(logger, 'log');

            const durationLogger = new DurationLogger(logger);

            durationLogger.start(`1 ${DurationLogger.DURATION_TOKEN}`);
            await sleep(50);
            durationLogger.stop();

            durationLogger.start(`2 ${DurationLogger.DURATION_TOKEN}`);
            await sleep(50);
            durationLogger.stop();

            expect(loggerSpy.calledTwice).to.be.true;
            expect(loggerSpy.getCall(0).args[0].message).to.not.equal(`1 ${DurationLogger.DURATION_TOKEN}`);
            expect(loggerSpy.getCall(1).args[0].message).to.not.equal(`2 ${DurationLogger.DURATION_TOKEN}`);
        });

        it('should log a properly configured message for multiple nested operations', async () => {
            const logger = winston.createLogger({});
            const loggerSpy = sandbox.spy(logger, 'log');

            const durationLogger = new DurationLogger(logger);

            durationLogger.start(`Overall ${DurationLogger.DURATION_TOKEN}`);
            durationLogger.start(`Detail ${DurationLogger.DURATION_TOKEN}`);
            durationLogger.start(`Detail 2 ${DurationLogger.DURATION_TOKEN}`);
            await sleep(50);
            durationLogger.stop();
            durationLogger.stop();
            durationLogger.stop();

            expect(loggerSpy.callCount).to.equal(3);
            // The nested operation should complete (pop off the duration message stack first) before the overall
            // operation succeeds
            expect(loggerSpy.getCall(0).args[0].message).to.not.equal(`Detail 2 ${DurationLogger.DURATION_TOKEN}`);
            expect(loggerSpy.getCall(1).args[0].message).to.not.equal(`Detail ${DurationLogger.DURATION_TOKEN}`);
            expect(loggerSpy.getCall(2).args[0].message).to.not.equal(`Overall ${DurationLogger.DURATION_TOKEN}`);
        });
    });
});
