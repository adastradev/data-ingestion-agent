
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import container from './test.inversify.config';
import TYPES from '../../ioc.types';

import IMessage from '../../source/IMessage';
import SendDataMessage from '../../source/Messages/SendDataMessage';
import SendDataHandler from '../../source/MessageHandlers/SendDataHandler';
import IDataWriter from '../../source/DataAccess/IDataWriter';
import * as sinon from 'sinon';
import { Logger } from 'winston';
import IntegrationConfigFactory from '../../source/IntegrationConfigFactory';
import IConnectionPool from '../../source/DataAccess/IConnectionPool';
import OracleDDLHelper from '../../source/DataAccess/Oracle/OracleDDLHelper';
import { TableNotFoundException } from '../../source/TableNotFoundException';
import Wizard, { getIntegrationTypes } from '../../cli/Wizard';

const expect = chai.expect;
const fillTemplate = (template, inputs): string => {
  return new Function('return `' + template + '`;').call(inputs);
};

describe.only('Wizard', () => {

    describe('getIntegrationTypes', () => {
      it('should produce valid choice options for each integration type', () => {
        const types = getIntegrationTypes();
        expect(types).to.have.length.greaterThan(0);
      });
    });

    describe('formatString', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
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
                advancedMode: false
              }
            };

            const result = fillTemplate(Wizard.formatString, args);
            expect(result).to.equal('docker run -it -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test -e ORACLE_ENDPOINT=someendpoint -e ORACLE_USER=test -e ORACLE_PASSWORD=test --network=bridge adastradev/data-ingestion-agent:latest ingest');
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
              advancedMode: false
            }
          };

          const result = fillTemplate(Wizard.formatString, args);
          expect(result).to.equal('docker run -it -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test --network=bridge adastradev/data-ingestion-agent:latest preview');
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
              advancedMode: false
            }
          };

          const result = fillTemplate(Wizard.formatString, args);
          expect(result).to.equal('docker run -d -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test -e ORACLE_ENDPOINT=someendpoint -e ORACLE_USER=test -e ORACLE_PASSWORD=test --network=bridge adastradev/data-ingestion-agent:latest ');
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
              concurrentConnections: 5
            }
          };

          const result = fillTemplate(Wizard.formatString, args);
          expect(result).to.equal('docker run -it -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=http://someuri -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 preview');
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
              concurrentConnections: 5
            }
          };

          const result = fillTemplate(Wizard.formatString, args);
          expect(result).to.equal('docker run -it -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test -e ORACLE_ENDPOINT=someendpoint -e ORACLE_USER=test -e ORACLE_PASSWORD=test -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=http://someuri -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 ingest');
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
              concurrentConnections: 5
            }
          };

          const result = fillTemplate(Wizard.formatString, args);
          expect(result).to.equal('docker run -d -m 2048M -e INTEGRATION_TYPE=Banner -e PROCESS_MAX_MEMORY_SIZE_MB=2048 -e ASTRA_CLOUD_USERNAME=test -e ASTRA_CLOUD_PASSWORD=test -e ORACLE_ENDPOINT=someendpoint -e ORACLE_USER=test -e ORACLE_PASSWORD=test -e LOG_LEVEL=silly -e DISCOVERY_SERVICE=http://someuri -e DEFAULT_STAGE=dev -e AWS_REGION=us-east-2 -e CONCURRENT_CONNECTIONS=5 --network=my-first-network adastradev/data-ingestion-agent:0.9 ');
        });
    });
});
