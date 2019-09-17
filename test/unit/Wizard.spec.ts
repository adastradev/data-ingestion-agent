
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import * as sinon from 'sinon';
import Wizard, { fillTemplate, getIntegrationTypes, validateNotEmptyString, validateNumberAndNonZero } from '../../cli/Wizard';
import { IntegrationType } from '../../source/IIntegrationConfig';
import inquirer = require('inquirer');

const expect = chai.expect;

interface IFormatTestCase {
  cfg: any;
  val: string | number;
  desc: string;
}

describe('Wizard', () => {

    describe('getIntegrationTypes', () => {
      it('should produce valid choice options for each integration type', () => {
        const types = getIntegrationTypes();
        const expectedKeys = Object.keys(IntegrationType)
          .filter((k) => [ 'NotImplemented', 'Unknown' ].indexOf(k) === -1)
          .map((t) => ({ name: t, value: t }));
        expect(types).to.deep.equal(expectedKeys);
      });
    });

    describe('validateNumberAndNonZero', () => {
      it('should validate that a positive value is valid', () => {
        const result = validateNumberAndNonZero('10');
        expect(typeof result).to.equal('boolean');
        expect(result).to.be.true;
      });

      it('should validate that a negative value is invalid', () => {
        const result = validateNumberAndNonZero('-10');
        expect(typeof result).to.equal('string');
      });

      it('should validate that a zero value is invalid', () => {
        const result = validateNumberAndNonZero('0');
        expect(typeof result).to.equal('string');
      });

      it('should validate that a non-integer value is invalid', () => {
        const result = validateNumberAndNonZero('something');
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
                dbEndpoint: '\'someendpoint\'',
                dbUser: 'test',
                dbPassword: 'test',
                advancedMode: false,
                confirmedAccurate: true
              }
            };

            const result = await Wizard.apply(Wizard.prompts, args);
            expect(result).to.be.false;
            expect(logSpy.getCall(logSpy.callCount - 2).args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest ingest');
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
              dbEndpoint: '\'someendpoint\'',
              dbUser: 'test',
              dbPassword: 'test',
              advancedMode: false,
              confirmedAccurate: true
            }
          };

          const result = await Wizard.apply(Wizard.prompts, args);
          expect(result).to.be.false;
          expect(logSpy.getCall(logSpy.callCount - 2).args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest preview');
        });

        // it('should produce a non-advanced mode background command', async () => {
        //   const args = {
        //     agent: {
        //       mode: '',
        //       integrationType: 'Banner',
        //       astraUserName: 'test',
        //       astraUserPassword: 'test',
        //       maxMemory: 2048,
        //       database: 'ORACLE',
        //       dbEndpoint: '\'someendpoint\'',
        //       dbUser: 'test',
        //       dbPassword: 'test',
        //       advancedMode: false,
        //       confirmedAccurate: true
        //     }
        //   };

        //   const result = await Wizard.apply(Wizard.prompts, args);
        //   expect(result).to.be.false;
        //   expect(logSpy.lastCall.args[0]).to.equal('docker run -d -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' --network=bridge adastradev/data-ingestion-agent:latest ');
        // });

        it('should produce an advanced mode preview command', async () => {
          const args = {
            agent: {
              mode: 'preview',
              integrationType: 'Banner',
              astraUserName: 'test',
              astraUserPassword: 'test',
              maxMemory: 2048,
              database: 'ORACLE',
              dbEndpoint: '\'someendpoint\'',
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
          expect(logSpy.getCall(logSpy.callCount - 2).args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\' -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 preview');
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
              dbEndpoint: '\'someendpoint\'',
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
          expect(logSpy.getCall(logSpy.callCount - 2).args[0]).to.equal('docker run -it -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\' -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 ingest');
        });

        // it('should produce an advanced mode background command', async () => {
        //   const args = {
        //     agent: {
        //       mode: '',
        //       integrationType: 'Banner',
        //       astraUserName: 'test',
        //       astraUserPassword: 'test',
        //       maxMemory: 2048,
        //       database: 'ORACLE',
        //       dbEndpoint: '\'someendpoint\'',
        //       dbUser: 'test',
        //       dbPassword: 'test',
        //       advancedMode: true,
        //       logLevel: 'silly',
        //       discoverySvcUri: 'http://someuri',
        //       defaultStage: 'dev',
        //       awsRegion: 'us-east-2',
        //       network: 'my-first-network',
        //       image: 'adastradev/data-ingestion-agent:0.9',
        //       concurrentConnections: 5,
        //       confirmedAccurate: true
        //     }
        //   };

        //   const result = await Wizard.apply(Wizard.prompts, args);
        //   expect(result).to.be.false;
        //   expect(logSpy.lastCall.args[0]).to.equal('docker run -d -m 2048M -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e INTEGRATION_TYPE=Banner -e ASTRA_CLOUD_USERNAME=\'test\' -e ASTRA_CLOUD_PASSWORD=\'test\' -e ORACLE_ENDPOINT=\'someendpoint\' -e ORACLE_USER=\'test\' -e ORACLE_PASSWORD=\'test\' -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=\'http://someuri\' -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 ');
        // });
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

    const validateFormat = (prompt: inquirer.Question, exp: IFormatTestCase) => {
      expect(fillTemplate(prompt.formatString, { agent: { ...exp.cfg }})).to.eq(exp.val);
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
      let prompt: inquirer.Question;
      const promptName = 'mode';
      const formats: IFormatTestCase[] = [
        { cfg: { mode: 'ingest'}, val: '-it ', desc: 'interactive mode when mode is specified'},
        { cfg: { mode: 'somefuturecmd'}, val: '-it ', desc: 'interactive mode when some future command is specified'}
      ];

      before(() => {
        prompt = Wizard.prompts.filter((p) => p.name === `agent.${promptName}`)[0];
      });

      it('provides a default', () => {
        process.env[promptName] = 'ingest';
        expect(prompt.default()).to.equal('ingest');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('preview');
      });

      // Leaving for future use when enabling background mode
      // it('filters the input when background is specified', () => {
      //   expect(prompt.filter('background')).to.equal('');
      // });

      // it('does not filter the input when input other than background is specified', () => {
      //   expect(prompt.filter('ingest')).to.equal('ingest');
      // });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.astraUserName', () => {
      let prompt;
      const promptName = 'astraUserName';
      const formats: IFormatTestCase[] = [
        { cfg: { astraUserName: 'Gary'}, val: '-e ASTRA_CLOUD_USERNAME=\'Gary\' ', desc: 'astra user name when specified'}
      ];

      before(() => {
        prompt = Wizard.prompts.filter((p) => p.name === `agent.${promptName}`)[0];
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.astraUserPassword', () => {
      let prompt;
      const promptName = 'astraUserPassword';
      const formats: IFormatTestCase[] = [
        { cfg: { astraUserPassword: 'somepwd'}, val: '-e ASTRA_CLOUD_PASSWORD=\'somepwd\' ', desc: 'astra user pwd when specified'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.maxMemory', () => {
      let prompt;
      const promptName = 'maxMemory';
      const formats: IFormatTestCase[] = [
        { cfg: { maxMemory: '4096'}, val: '-m 4096M -e PROCESS_MAX_MEMORY_SIZE_MB=4096 ', desc: 'docker and agent memory configurations'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = '1024';
        expect(prompt.default()).to.equal('1024');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('2048');
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.integrationType', () => {
      let prompt;
      const promptName = 'integrationType';
      const formats: IFormatTestCase[] = [
        { cfg: { integrationType: 'Banner'}, val: '-e INTEGRATION_TYPE=Banner ', desc: 'integration type'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'Banner';
        expect(prompt.default()).to.equal('Banner');
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
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
      const formats: IFormatTestCase[] = [
        { cfg: { database: 'ORACLE', dbEndpoint: '\'someone@host:port/orcl\'' }, val: '-e ORACLE_ENDPOINT=\'someone@host:port/orcl\' ', desc: 'database connection string'}
      ];

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

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.dbUser', () => {
      let prompt;
      const promptName = 'dbUser';
      const formats: IFormatTestCase[] = [
        { cfg: { database: 'ORACLE', dbUser: 'someone' }, val: '-e ORACLE_USER=\'someone\' ', desc: 'database user name'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      it('is only active in non-preview mode', () => {
        validatePromptActiveInNonPreviewMode(prompt);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.dbPassword', () => {
      let prompt;
      const promptName = 'dbPassword';
      const formats: IFormatTestCase[] = [
        { cfg: { database: 'ORACLE', dbPassword: 'somepwd' }, val: '-e ORACLE_PASSWORD=\'somepwd\' ', desc: 'database pwd'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        providesStandardDefault(prompt, promptName);
      });

      it('is only active in non-preview mode', () => {
        validatePromptActiveInNonPreviewMode(prompt);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
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
      const formats: IFormatTestCase[] = [
        { cfg: { logLevel: 'silly' }, val: '-e LOG_LEVEL=silly ', desc: 'log level'},
        { cfg: { }, val: '-e LOG_LEVEL=info ', desc: 'default log level when no level is specific'}
      ];

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

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.image', () => {
      let prompt;
      const promptName = 'image';
      const formats: IFormatTestCase[] = [
        { cfg: { image: 'adastradev/data-ingestion-agent:0.0.1' }, val: 'adastradev/data-ingestion-agent:0.0.1 ', desc: 'alternate image'},
        { cfg: { }, val: 'adastradev/data-ingestion-agent:latest ', desc: 'default image when no alternative image is specified'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('adastradev/data-ingestion-agent:latest');
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.network', () => {
      let prompt;
      const promptName = 'network';
      const formats: IFormatTestCase[] = [
        { cfg: { networkCustom: 'somenetwork' }, val: '--network=somenetwork ', desc: 'custom network'},
        { cfg: { network: 'host' }, val: '--network=host ', desc: 'standard alternate network'},
        { cfg: { }, val: '--network=bridge ', desc: 'standard network'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      it('provides a default', () => {
        process.env[promptName] = 'somethingelse';
        expect(prompt.default()).to.equal('somethingelse');
        delete process.env[promptName];
        expect(prompt.default()).to.equal('bridge');
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
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
      const formats: IFormatTestCase[] = [
        { cfg: { discoverySvcUri: 'someservice' }, val: '-e DISCOVERY_SERVICE=\'someservice\' ', desc: 'discovery service URI'}
      ];

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

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.defaultStage', () => {
      let prompt;
      const promptName = 'defaultStage';
      const formats: IFormatTestCase[] = [
        { cfg: { defaultStage: 'dev' }, val: '-e DEFAULT_STAGE=dev ', desc: 'default stage'}
      ];

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
        expect(prompt.default()).to.equal('prod');
      });

      it('is only active in advanced mode', () => {
        validatePromptActiveInAdvancedwMode(prompt);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.awsRegion', () => {
      let prompt;
      const promptName = 'awsRegion';
      const formats: IFormatTestCase[] = [
        { cfg: { awsRegion: 'us-east-2' }, val: '-e AWS_REGION=us-east-2 ', desc: 'aws region'}
      ];

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

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.concurrentConnections', () => {
      let prompt;
      const promptName = 'concurrentConnections';
      const formats: IFormatTestCase[] = [
        { cfg: { concurrentConnections: '3' }, val: '-e CONCURRENT_CONNECTIONS=3 ', desc: 'concurrent connections'}
      ];

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

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });

    describe('prompts.agent.confirmedAccurate', () => {
      let prompt;
      const promptName = 'confirmedAccurate';
      const formats: IFormatTestCase[] = [
        { cfg: { mode: 'ingest' }, val: 'ingest', desc: 'mode'}
      ];

      before(() => {
        prompt = getAgentPromptName(promptName);
      });

      for (const exp of formats) {
        it(`formats ${exp.desc}`, () => {
          validateFormat(prompt, exp);
        });
      }
    });
});
