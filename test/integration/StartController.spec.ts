
import 'reflect-metadata';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as shell from 'child_process';
import fetch from 'node-fetch';
import StartController from '../../source/StartController';

const expect = chai.expect;

const getRandomPort = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

describe('StartController', () => {
    describe('startHealthCheckServer', () => {
        let controller: StartController;
        after(() => {
            if (controller) {
                controller.stopHealthCheckServer();
            }
        });

        it('should should start the server and report back a failed state because no process has been started', async () => {
            const randomPort = getRandomPort(32767, 61000);
            controller = new StartController([ 'preview' ], randomPort);

            controller.startHealthCheckServer();

            // make a request and check result
            const result = await fetch(`http://0.0.0.0:${randomPort}`);

            expect(result.status).to.eq(500);
        });
    });
    describe('spawnAgent', () => {
        let controller: StartController;
        let sandbox: sinon.SinonSandbox;

        before(() => {
            sandbox = sinon.createSandbox();
        });

        after(() => {
            sandbox.restore();

            if (process.env.PROCESS_MAX_MEMORY_SIZE_MB) {
                delete process.env.PROCESS_MAX_MEMORY_SIZE_MB;
            }
        });

        it('should attempt to spawn the agent in preview mode', async () => {
            const randomPort = getRandomPort(32767, 61000);
            const outEventStub = sandbox.stub();
            const errEventStub = sandbox.stub();
            const unrefStub = sandbox.stub();
            const onProcessEventStub = sandbox.stub();
            const killStub = sandbox.stub();

            // Dummy 
            const newProc: any = {
                unref: unrefStub,
                stdout: {
                    on: outEventStub
                },
                stderr: {
                    on: errEventStub
                },
                on: onProcessEventStub,
                kill: killStub
            };

            const spawnStub = sandbox.stub(shell, 'spawn').returns(newProc);

            controller = new StartController([ 'preview' ], randomPort);
            process.env.PROCESS_MAX_MEMORY_SIZE_MB = '4000';

            controller.spawnAgent();

            expect(spawnStub.calledOnce).to.be.true;
            expect(spawnStub.getCall(0).args).to.deep.equal(['node', ['--max-old-space-size=3000', 'dist/index.js', 'preview']]);
            expect(outEventStub.calledOnce).to.be.true;
            expect(outEventStub.getCall(0).args).includes('data');
            expect(errEventStub.calledOnce).to.be.true;
            expect(errEventStub.getCall(0).args).includes('data');
            expect(unrefStub.calledOnce).to.be.true;
            expect(onProcessEventStub.calledOnce).to.be.true;
            expect(onProcessEventStub.getCall(0).args).includes('exit');
        });
    });
});
