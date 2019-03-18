// tslint:disable:no-conditional-assignment

import container from './test.inversify.config';
import * as chai from 'chai';
import * as sinon from 'sinon';
import { errorHandler, requestHandler } from '../../source/healthCheckHandler';

const expect = chai.expect;

describe('healthcheck', () => {
    describe('requestHandler', () => {

        const sandbox: sinon.SinonSandbox = sinon.createSandbox();

        afterEach(() => {
            sandbox.restore();
        });

        const testCases = [
            { statusCode: 200, exitCallArg: 0 },
            { statusCode: 201, exitCallArg: 1 },
            { statusCode: 204, exitCallArg: 1 },
            { statusCode: 302, exitCallArg: 1 },
            { statusCode: 400, exitCallArg: 1 },
            { statusCode: 401, exitCallArg: 1 },
            { statusCode: 403, exitCallArg: 1 },
            { statusCode: 404, exitCallArg: 1 },
            { statusCode: 409, exitCallArg: 1 },
            { statusCode: 500, exitCallArg: 1 },
            { statusCode: 501, exitCallArg: 1 },
            { statusCode: 502, exitCallArg: 1 },
            { statusCode: 503, exitCallArg: 1 },
            { statusCode: 504, exitCallArg: 1 }
        ];

        for (const testCase of testCases) {
            it(`should exit the healthcheck process with an error code of ${testCase.exitCallArg} when a status code of ${testCase.statusCode} is encountered`, async () => {
                const processExitSpy = sandbox.stub(process, 'exit');
                requestHandler({ statusCode: testCase.statusCode } as any);
                expect(processExitSpy.calledOnceWith(testCase.exitCallArg)).to.be.true;
            });
        }
    });

    describe('errorHandler', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();

        afterEach(() => {
            sandbox.restore();
        });

        it('should kill the process', async () => {
            const processExitSpy = sandbox.stub(process, 'exit');
            errorHandler('error');
            expect(processExitSpy.calledOnceWith(1)).to.be.true;
        });
    });
});
