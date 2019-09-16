
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import * as sinon from 'sinon';
import Wizard, { getIntegrationTypes, validateNonZero, validateNotEmptyString } from '../../cli/Wizard';
import { IntegrationType } from '../../source/IIntegrationConfig';

const expect = chai.expect;

describe.only('Wizard', () => {

    describe('getIntegrationTypes', () => {
      it('should produce valid choice options for each integration type', () => {
        const types = getIntegrationTypes();
        const expectedKeys = Object.keys(IntegrationType)
          .filter((k) => [ 'NotImplemented', 'Unknown' ].indexOf(k) === -1)
          .map((t) => ({ name: t, value: t }));
        expect(types).to.deep.equal(expectedKeys);
      });
    });

    describe('validateNonZero', () => {
      it('should validate that a positive value is valid', () => {
        const result = validateNonZero(10);
        expect(typeof result).to.equal('boolean');
      });

      it('should validate that a negative value is invalid', () => {
        const result = validateNonZero(-10);
        expect(typeof result).to.equal('string');
      });

      it('should validate that a zero value is invalid', () => {
        const result = validateNonZero(0);
        expect(typeof result).to.equal('string');
      });
    });

    describe('validateNotEmptyString', () => {
      it('should validate that a non-empty value is valid', () => {
        const result = validateNotEmptyString('test');
        expect(typeof result).to.equal('boolean');
      });

      it('should validate that an empty value is invalid', () => {
        const result = validateNotEmptyString('');
        expect(typeof result).to.equal('string');
      });

      it('should validate that an multi-whitespace value is invalid', () => {
        const result = validateNotEmptyString('    ');
        expect(typeof result).to.equal('string');
      });

      it('should validate that an single whitespace value is invalid', () => {
        const result = validateNotEmptyString(' ');
        expect(typeof result).to.equal('string');
      });
    });

    describe('Wizard.apply', () => {
        let sandbox: sinon.SinonSandbox;
        let logSpy: sinon.SinonSpy;

        before(() => {
          sandbox = sinon.createSandbox();
        });

        beforeEach(() => {
            logSpy = sandbox.spy(console, 'log');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should produce a non-advanced mode ingest command', async () => {
            const args = {
              agent: {
                mode: 'ingest',
                integrationType: 'Banner',
                astraUserName: 'test',
                astraUserPassword: 'test',
                maxMemory: 2048,
                database: 'ORACLE',
                dbEndpoint: 'someendpoint',
                dbUser: 'test',
                dbPassword: 'test',
                advancedMode: false,
                confirmedAccurate: true
              }
            };

            const result = await Wizard.apply(Wizard.prompts, args);
            expect(result).to.be.false;
            expect(logSpy.lastCall.args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest ingest');
        });

        it('should produce a non-advanced mode preview command', async () => {
          const args = {
            agent: {
              mode: 'preview',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
              database: 'ORACLE',
              dbEndpoint: 'someendpoint',
              dbUser: 'test',
              dbPassword: 'test',
              advancedMode: false,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.lastCall.args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest preview');
        });

        it('should produce a non-advanced mode background command', async () => {
          const args = {
            agent: {
              mode: '',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
              database: 'ORACLE',
              dbEndpoint: 'someendpoint',
              dbUser: 'test',
              dbPassword: 'test',
              advancedMode: false,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.lastCall.args[0]).to.equal('docker run -d -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest ');
        });

        it('should produce an advanced mode preview command', async () => {
          const args = {
            agent: {
              mode: 'preview',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
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
              concurrentConnections: 5,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.lastCall.args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\'--network=my-first-network -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 adastradev/data-ingestion-agent:0.9 preview');
        });

        it('should produce an advanced mode ingest command', async () => {
          const args = {
            agent: {
              mode: 'ingest',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
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
              concurrentConnections: 5,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.lastCall.args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\'--network=my-first-network -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 adastradev/data-ingestion-agent:0.9 ingest');
        });

        it('should produce an advanced mode background command', async () => {
          const args = {
            agent: {
              mode: '',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
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
              concurrentConnections: 5,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.lastCall.args[0]).to.equal('docker run -d -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\'--network=my-first-network -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 adastradev/data-ingestion-agent:0.9 ');
        });
    });

    const validatePromptActiveInNonPreviewMode = (prompt) => {
      let result = prompt.when({ agent: { mode: 'preview' }});
      expect(result).to.be.false;
      result = prompt.when({ agent: { mode: 'background' }});
      expect(result).to.be.true;
      result = prompt.when({ agent: { mode: 'ingest' }});
      expect(result).to.be.true;
    };

    const validatePromptActiveInAdvancedwMode = (prompt) => {
      let result = prompt.when({ agent: { advancedMode: true }});
      expect(result).to.be.true;
      result = prompt.when({ agent: { advancedMode: false }});
      expect(result).to.be.false;
    };

    const providesStandardDefault = (prompt, promptName) => {
      process.env[promptName] = 'somevalue';
      expect(prompt.default()).to.equal('somevalue');
      delete process.env[promptName];
      expect(prompt.default()).to.equal('');
    };

    const getAgentPromptName = (promptName) => {
      return Wizard.prompts.filter((p) => p.name === `agent.${promptName}`)[0];
    };

    describe('prompts.agent.mode', () => {
      let prompt;
      const promptName = 'mode';

      before(() => {
        prompt = Wizard.prompts.filter((p) => p.name === `agent.${promptName}`)[0];
      });

      it('provides a default', () => {
        process.env[promptName] = 'ingest';
        expect(prompt.default()).to.equal('ingest');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('preview');
      });

      it('filters the input when background is specified', () => {
        expect(prompt.filter('background')).to.equal('');
      });

      it('does not filter the input when input other than background is specified', () => {
        expect(prompt.filter('ingest')).to.equal('ingest');
      });
    });

    describe('prompts.agent.astraUserName', () => {
      let prompt;
      const promptName = 'astraUserName';

      before(() => {
        prompt = Wizard.prompts.filter((p) => p.name === `agent.${promptName}`)[0];
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });
    });

    describe('prompts.agent.astraUserPassword', () => {
      let prompt;
      const promptName = 'astraUserPassword';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });
    });

    describe('prompts.agent.maxMemory', () => {
      let prompt;
      const promptName = 'maxMemory';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = '1024';
        expect(prompt.default()).to.equal('1024');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('2048');
      });
    });

    describe('prompts.agent.integrationType', () => {
      let prompt;
      const promptName = 'integrationType';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'Banner';
        expect(prompt.default()).to.equal('Banner');
      });
    });

    describe('prompts.agent.database', () => {
      let prompt;
      const promptName = 'database';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'MSSQL';
        expect(prompt.default()).to.equal('MSSQL');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('ORACLE');
      });
    });

    describe('prompts.agent.dbEndpoint', () => {
      let prompt;
      const promptName = 'dbEndpoint';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somevalue';
        expect(prompt.default()).to.equal('somevalue');
        process.env[promptName] = '"somevalue"';
        expect(prompt.default()).to.equal('somevalue');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('');
      });

      it('is only active in non-preview mode', () => {
        validatePromptActiveInNonPreviewMode(prompt);
      });

      it('filters the input when a value is specified', () => {
        expect(prompt.filter('someendpoint')).to.equal('"someendpoint"');
        expect(prompt.filter('')).to.equal('');
      });
    });

    describe('prompts.agent.dbUser', () => {
      let prompt;
      const promptName = 'dbUser';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      it('is only active in non-preview mode', () => {
        validatePromptActiveInNonPreviewMode(prompt);
      });
    });

    describe('prompts.agent.dbPassword', () => {
      let prompt;
      const promptName = 'dbPassword';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      it('is only active in non-preview mode', () => {
        validatePromptActiveInNonPreviewMode(prompt);
      });
    });

    describe('prompts.agent.advancedMode', () => {
      let prompt;
      const promptName = 'dbPassword';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });
    });

    describe('prompts.agent.logLevel', () => {
      let prompt;
      const promptName = 'logLevel';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'error';
        expect(prompt.default()).to.equal('error');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('info');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });
    });

    describe('prompts.agent.image', () => {
      let prompt;
      const promptName = 'image';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('adastradev/data-ingestion-agent:latest');
      });
    });

    describe('prompts.agent.network', () => {
      let prompt;
      const promptName = 'network';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('bridge');
      });
    });

    describe('prompts.agent.networkCustom', () => {
      let prompt;
      const promptName = 'networkCustom';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('bridge');
      });

      it('is only active in advanced mode', () => {
        let result = prompt.when({ agent: { advancedMode: true, network: 'custom' }});
        expect(result).to.be.true;
        result = prompt.when({ agent: { advancedMode: true, network: 'bridge' }});
        expect(result).to.be.false;
        result = prompt.when({ agent: { advancedMode: false, network: 'bridge' }});
        expect(result).to.be.false;
      });
    });

    describe('prompts.agent.discoverySvcUri', () => {
      let prompt;
      const promptName = 'discoverySvcUri';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env.DISCOVERY_SERVICE = 'userspecified';
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('userspecified');
        delete process.env.DISCOVERY_SERVICE;
        expect(prompt.default()).to.equal('');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });
    });

    describe('prompts.agent.defaultStage', () => {
      let prompt;
      const promptName = 'defaultStage';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env.DEFAULT_STAGE = 'userspecified';
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('userspecified');
        delete process.env.DEFAULT_STAGE;
        expect(prompt.default()).to.equal('');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });
    });

    describe('prompts.agent.awsRegion', () => {
      let prompt;
      const promptName = 'awsRegion';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env.AWS_REGION = 'userspecified';
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('userspecified');
        delete process.env.AWS_REGION;
        expect(prompt.default()).to.equal('us-east-1');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });
    });

    describe('prompts.agent.concurrentConnections', () => {
      let prompt;
      const promptName = 'concurrentConnections';

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env.CONCURRENT_CONNECTIONS = '5';
        process.env[promptName] = '3';
        expect(prompt.default()).to.equal('3');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('5');
        delete process.env.CONCURRENT_CONNECTIONS;
        expect(prompt.default()).to.equal('5');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });
    });
});
