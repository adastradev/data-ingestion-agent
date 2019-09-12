import * as inquirer from 'inquirer';
import { ICommandConfig } from './ICommandConfig';
import { IntegrationType } from '../source/IIntegrationConfig';

export const validateNonZero = (input: number): boolean | string => {
  if (input > 0) {
    return true;
  } else {
    return 'Memory value must be greater than zero, please retry entering a valid value';
  }
};

export const validateNotEmptyString = (input: string): boolean | string => {
  if (input.trim().length > 0) {
    return true;
  } else {
    return 'Please enter a value for this parameter';
  }
};

export const getIntegrationTypes = () => {
  return Object.keys(IntegrationType)
    .filter((k) => [ 'NotImplemented', 'Unknown' ].indexOf(k) === -1)
    .map((t) => ({ name: t, value: t }));
};

export default {
  successMessages: [
    'Copy and paste the following command to run the ingestion agent:',
    '----------------------------------------------------------------'
  ],
  prompts: [
      {
        type: 'list',
        name: 'agent.mode',
        message: 'In what mode would you like the agent to run?',
        choices: [
          { name: 'Ingest Once', value: 'ingest', short: 0 },
          { name: 'Preview Ingest Queries', value: 'preview', short: 1 },
          { name: 'Always Run in Background (Advanced)', value: 'background', short: 2 }
        ],
        default: () => process.env.mode || 'preview',
        filter: (input) => {
          return (input === 'background') ? '' : input;
        }
      },
      {
        type: 'input',
        name: 'agent.astraUserName',
        message: 'Enter your Astra Cloud user name:',
        filter: (input) => (input.length > 0) ? `"${input}"` : '',
        default: () => process.env.astraUserName ? `${process.env.astraUserName}`.replace(/"/g, '') : '',
        validate: validateNotEmptyString
      },
      {
        type: 'password',
        name: 'agent.astraUserPassword',
        message: 'Enter your Astra Cloud password:',
        filter: (input) => (input.length > 0) ? `"${input}"` : '',
        default: () => process.env.astraUserPassword ? `${process.env.astraUserPassword}`.replace(/"/g, '') : '',
        validate: validateNotEmptyString
      },
      {
        type: 'number',
        name: 'agent.maxMemory',
        message: 'How much memory (in megabytes) should be allocated to the agent?',
        default: () => process.env.maxMemory || '2048',
        validate: validateNonZero
      },
      {
        type: 'list',
        name: 'agent.integrationType',
        message: 'Which information system will the agent ingest data from?',
        choices: getIntegrationTypes(),
        default: () => process.env.integrationType
      },
      {
        type: 'list',
        name: 'agent.database',
        message: 'What database technology does your student information system use?',
        choices: [
          { name: 'Oracle', value: 'ORACLE', short: 0 },
          { name: 'Microsoft SQL Server (not supported)', value: 'MSSQL', short: 1 }
        ],
        default: () => process.env.database || 'ORACLE'
      },
      {
        type: 'input',
        name: 'agent.dbEndpoint',
        message: 'Enter the database connection string:',
        filter: (input) => (input.length > 0) ? `"${input}"` : '',
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => (process.env.dbEndpoint || '').replace(/"/g, ''),
        validate: validateNotEmptyString
      },
      {
        type: 'input',
        name: 'agent.dbUser',
        message: 'Enter database user:',
        filter: (input) => (input.length > 0) ? `"${input}"` : '',
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => process.env.dbUser ? `${process.env.dbUser}`.replace(/"/g, '') : '',
        validate: validateNotEmptyString
      },
      {
        type: 'password',
        name: 'agent.dbPassword',
        message: 'Enter database users password:',
        filter: (input) => (input.length > 0) ? `"${input}"` : '',
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => process.env.dbPassword ? `${process.env.dbPassword}`.replace(/"/g, '') : '',
        validate: validateNotEmptyString
      },
      {
        type: 'confirm',
        name: 'agent.advancedMode',
        message: 'Would you like to configure advanced run settings?',
      },
      {
        type: 'list',
        name: 'agent.logLevel',
        message: 'How verbose should logged information of the agent be?',
        choices: [
          { name: 'Errors', value: 'error', short: 0 },
          { name: 'Warnings, Errors', value: 'warn', short: 1 },
          { name: 'Informational, Warnings, Errors', value: 'info', short: 2 },
          { name: 'Verbose', value: 'verbose', short: 3 },
          { name: 'Debug', value: 'debug', short: 4 },
          { name: 'All', value: 'silly', short: 5 }
        ],
        default: () => process.env.logLevel || 'info',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.image',
        message: 'Enter an alternative docker image to use:',
        default: () => process.env.image || 'adastradev/data-ingestion-agent:latest',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString
      },
      {
        type: 'list',
        name: 'agent.network',
        message: 'Enter the docker network to use:',
        choices: [
          { name: 'bridge', value: 'bridge', short: 0 },
          { name: 'host', value: 'host', short: 1 },
          { name: 'custom', value: 'custom', short:  2}
        ],
        default: () => process.env.network || 'bridge',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.networkCustom',
        message: 'Enter the custom docker network identifier:',
        default: () => process.env.networkCustom || 'bridge',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode && answers.agent.network === 'custom',
        validate: validateNotEmptyString
      },
      {
        type: 'input',
        name: 'agent.discoverySvcUri',
        message: 'Enter the alternative discovery service URI:',
        default: () => process.env.discoverySvcUri || process.env.DISCOVERY_SERVICE || '',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString
      },
      {
        type: 'input',
        name: 'agent.defaultStage',
        message: 'Enter the alternative default stage:',
        default: () => process.env.defaultStage || process.env.DEFAULT_STAGE || '',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString
      },
      {
        type: 'input',
        name: 'agent.awsRegion',
        message: 'Enter the alternative AWS region:',
        default: () => process.env.awsRegion || process.env.AWS_REGION || 'us-east-1',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString
      },
      {
        type: 'number',
        name: 'agent.concurrentConnections',
        message: 'Enter the maximum number of concurrent database connections allowed:',
        validate: validateNonZero,
        default: () => process.env.concurrentConnections || process.env.CONCURRENT_CONNECTIONS || '5',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'confirm',
        name: 'agent.confirmedAccurate',
        message: 'Are all of the entered values correct?'
      }
    ],

  formatString: [
    'docker run ',
    '${(this.agent.mode === "") ? "-d" : "-it"} ',
    '-m ${this.agent.maxMemory}M ',
    '-e INTEGRATION_TYPE=${this.agent.integrationType} ',
    '-e PROCESS_MAX_MEMORY_SIZE_MB=${this.agent.maxMemory} ',
    '-e ASTRA_CLOUD_USERNAME=${this.agent.astraUserName} ',
    '-e ASTRA_CLOUD_PASSWORD=${this.agent.astraUserPassword} ',
    '${(this.agent.mode !== "preview") ? ("-e " + this.agent.database + "_ENDPOINT=" + this.agent.dbEndpoint + " ") : ""}',
    '${(this.agent.mode !== "preview") ? ("-e " + this.agent.database + "_USER=" + this.agent.dbUser + " ") : ""}',
    '${(this.agent.mode !== "preview") ? ("-e " + this.agent.database + "_PASSWORD=" + this.agent.dbPassword + " ") : ""}',
    '${(this.agent.advancedMode === true) ? "-e LOG_LEVEL=" + (this.agent.logLevel || "info") + " " : ""}',
    '${(this.agent.advancedMode === true) ? "-e DISCOVERY_SERVICE=" + this.agent.discoverySvcUri + " " : ""}',
    '${(this.agent.advancedMode === true) ? "-e DEFAULT_STAGE=" + this.agent.defaultStage + " " : ""}',
    '${(this.agent.advancedMode === true) ? "-e AWS_REGION=" + this.agent.awsRegion + " " : ""}',
    '${(this.agent.advancedMode === true) ? "-e CONCURRENT_CONNECTIONS=" + this.agent.concurrentConnections + " " : ""}',
    '--network=${(this.agent.networkCustom || this.agent.network || "bridge")} ',
    '${(this.agent.image || "adastradev/data-ingestion-agent:latest")} ',
    '${this.agent.mode}'
  ]
  // Adding a delimiter produces an ugly output when some format strings produce empty results
  .join('')
} as ICommandConfig;
