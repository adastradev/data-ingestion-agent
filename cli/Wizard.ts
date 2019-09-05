import * as inquirer from 'inquirer';
import { ICommandConfig } from './ICommandConfig';

const validateMemoryValue = (input: number) => {
  if (input > 0) {
    return true;
  } else {
    return 'Memory value must be greater than zero, please retry entering a valid value';
  }
};

export default {
  prompts: [
      {
        type: 'list',
        name: 'agent.mode',
        message: 'In what mode would you like the agent to run?',
        choices: [
          { name: 'Ingest Once', value: 'ingest', short: 0 },
          { name: 'Preview Ingest Queries', value: 'preview', short: 1 },
          { name: 'Always Run in Background (Advanced)', value: '', short: 2 }
        ],
        default: 'preview'
      },
      {
        type: 'input',
        name: 'agent.astraUserName',
        message: 'Enter your Astra Cloud user name:'
      },
      {
        type: 'password',
        name: 'agent.astraUserPassword',
        message: 'Enter your Astra Cloud password:'
      },
      {
        type: 'number',
        name: 'agent.maxMemory',
        message: 'How much memory (in megabytes) should be allocated to the agent?',
        default: '2048',
        validate: validateMemoryValue
      },
      {
        type: 'list',
        name: 'agent.database',
        message: 'What database technology does your student information system use?',
        choices: [
          { name: 'Oracle', value: 'ORACLE', short: 0 },
          { name: 'Microsoft SQL Server (not supported)', value: 'MSSQL', short: 1 }
        ],
        default: 'ORACLE'
      },
      {
        type: 'input',
        name: 'agent.dbEndpoint',
        message: 'Enter the database connection string:'
      },
      {
        type: 'input',
        name: 'agent.dbUser',
        message: 'Enter database user:'
      },
      {
        type: 'password',
        name: 'agent.dbPassword',
        message: 'Enter database users password:'
      },
      {
        type: 'confirm',
        name: 'agent.advancedMode',
        message: 'Would you like to configure advanced run settings?'
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
          { name: 'All', value: 'silly', short: 3 }
        ],
        default: 'info',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.image',
        message: 'Enter an alternative docker image to use:',
        default: 'adastradev/data-ingestion-agent:latest',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'choice',
        name: 'agent.network',
        message: 'Enter the docker network to use:',
        choices: [
          { name: 'bridge', value: 'bridge', short: 0 },
          { name: 'host', value: 'host', short: 1 },
          { name: 'custom', value: 'custom', short:  2}
        ],
        default: 'bridge',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.network',
        message: 'Enter the custom docker network identifier:',
        default: 'bridge',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode && answers.agent.network === 'custom'
      },
      {
        type: 'input',
        name: 'agent.discoverySvcUri',
        message: 'Enter the alternative discovery service URI:',
        default: process.env.DISCOVERY_SERVICE || '',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.defaultStage',
        message: 'Enter the alternative default stage:',
        default: process.env.DEFAULT_STAGE || '',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      },
      {
        type: 'input',
        name: 'agent.awsRegion',
        message: 'Enter the alternative AWS region:',
        default: process.env.AWS_REGION || 'us-east-1',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode
      }
    ],

  formatString: [
    'docker run',
    '${(this.agent.mode === "") ? "-d" : "-it"}',
    '-m ${this.agent.maxMemory}M -e PROCESS_MAX_MEMORY_SIZE_MB=${this.agent.maxMemory}',
    '-e ASTRA_CLOUD_USERNAME=${this.agent.astraUserName}',
    '-e ASTRA_CLOUD_PASSWORD=${this.agent.astraUserPassword}',
    '-e ${this.agent.database}_ENDPOINT="${this.agent.dbEndpoint}"',
    '-e ${this.agent.database}_USER=${this.agent.dbUser}',
    '-e ${this.agent.database}_PASSWORD=${this.agent.dbPassword}',
    '${(this.agent.advancedMode === true) ? "-e LOG_LEVEL=" + this.agent.logLevel || "info" : null}',
    '${(this.agent.advancedMode === true) ? "-e DISCOVERY_SERVICE=" + this.agent.discoverySvcUri : null}',
    '${(this.agent.advancedMode === true) ? "-e DEFAULT_STAGE=" + this.agent.defaultStage : null}',
    '${(this.agent.advancedMode === true) ? "-e AWS_REGION=" + this.agent.awsRegion : null}',
    '--network=${this.agent.network || "bridge"}',
    '${this.agent.image || "adastradev/data-ingestion-agent:latest"}',
    '${this.agent.mode}'
  ]
  .filter((s) => s.length > 0)
  .join(' ')
} as ICommandConfig;
