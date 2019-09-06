
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import * as inquirer from 'inquirer';

import * as sinon from 'sinon';
import cli from '../../cli/cli';

const expect = chai.expect;

describe('cli', () => {
  let sandbox: sinon.SinonSandbox;
  let agentArgs: any;

  before(() => {
    sandbox = sinon.createSandbox();
    agentArgs = {
      mode: 'preview',
      integrationType: 'Banner',
      astraUserName: 'test',
      astraUserPassword: 'test',
      maxMemory: '2048',
      database: 'ORACLE',
      dbEndpoint: 'someendpoint',
      dbUser: 'test',
      dbPassword: 'test',
      advancedMode: true,
      logLevel: 'silly',
      discoverySvcUri: 'http://someuri',
      defaultStage: 'dev',
      awsRegion: 'us-east-2',
      network: 'my-first-network',
      image: 'adastradev/data-ingestion-agent:0.9',
      concurrentConnections: '5',
      confirmedAccurate: true
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('prompt the user and loop once when the user did not need to edit their inputs', async () => {
    const promptStub = sandbox.stub(inquirer, 'prompt').returns({
      agent: agentArgs
    } as any);

    const shouldContinue = await cli(['wizard']);

    expect(promptStub.calledOnce, 'Should have been called only once').to.be.true;
    expect(shouldContinue).to.be.false;
  });

  it('prompt the user and loop once when the user did not need to edit their inputs', async () => {
    const inaccurateArgs = Object.assign({}, agentArgs);
    inaccurateArgs.confirmedAccurate = false;
    const promptStub = sandbox.stub(inquirer, 'prompt')
      .onFirstCall()
        .returns({
          agent: inaccurateArgs
        } as any)
      .onSecondCall()
        .returns({
          agent: agentArgs
        } as any);

    const shouldContinue = await cli(['wizard']);

    expect(promptStub.calledTwice, 'Should have been called exactly twice').to.be.true;
    expect(shouldContinue).to.be.false;
  });

  it('prompt the user and loop once when the user did not need to edit their inputs', async () => {
    const shouldContinue = await cli(['unknowncommand']);
    const promptStub = sandbox.stub(inquirer, 'prompt');
    expect(promptStub.notCalled, 'Should not have been called').to.be.true;
    expect(shouldContinue).to.be.true;
  });
});
