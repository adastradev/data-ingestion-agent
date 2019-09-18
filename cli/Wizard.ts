import * as inquirer from 'inquirer';
import { orderBy } from 'lodash';
import { ICommandConfig } from './ICommandConfig';
import { IntegrationType } from '../source/IIntegrationConfig';

export const validateNumberAndNonZero = (input: string): boolean | string => {
  if (tryParseInt(input, 0) > 0) {
    return true;
  } else {
    return 'Memory value must be an integer that is greater than zero, please retry entering a valid value';
  }
};

const tryParseInt = (str, defaultValue) => {
  let retValue = defaultValue;
  if (str !== null && str.length > 0 && !isNaN(str)) {
    retValue = parseInt(str, 0);
  }
  return retValue;
}

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

export const fillTemplate = (template, inputs): string => {
  return new Function('return `' + template + '`;').call(inputs);
};

export const logCommand = (desc: string, cmd: string) => {
  const title = `# ${desc} #`;
  const hr = '*'.repeat(title.length);
  console.log(hr);
  console.log(title);
  console.log(hr);
  console.log();
  console.log(cmd);
  console.log();
};

export default {
  successMessages: [
    '',
    '----------------------------------------------------------------------',
    'Use one of the following commands applicable to your shell environment',
    'to run the data ingestion agent. Some values may need to be modified',
    'to work with your configuration.',
    '----------------------------------------------------------------------',
    ''
  ],
  prompts: [
      {
        type: 'list',
        name: 'agent.mode',
        message: 'In what mode would you like the agent to run?',
        choices: [
          { name: 'Ingest Once', value: 'ingest', short: 0 },
          { name: 'Preview Ingest Queries', value: 'preview', short: 1 }
          // { name: 'Always Run in Background (Advanced)', value: 'background', short: 2 }
        ],
        default: () => process.env.mode || 'preview',
        // Leaving for future use when enabling background mode
        // filter: (input) => {
        //   return (input === 'background') ? '' : input;
        // },
        // formatString: '${(this.agent.mode === "") ? "-d" : "-it"} '
        formatOrder: 1,
        formatString: '-it '
      },
      {
        type: 'input',
        name: 'agent.astraUserName',
        message: 'Enter your Astra Cloud user name:',
        default: () => process.env.astraUserName || '',
        validate: validateNotEmptyString,
        formatOrder: 4,
        formatString: '-e ASTRA_CLOUD_USERNAME=\'${this.agent.astraUserName}\' '
      },
      {
        type: 'password',
        name: 'agent.astraUserPassword',
        message: 'Enter your Astra Cloud password:',
        default: () => process.env.astraUserPassword || '',
        validate: validateNotEmptyString,
        formatOrder: 5,
        formatString: '-e ASTRA_CLOUD_PASSWORD=\'${this.agent.astraUserPassword}\' '
      },
      {
        type: 'input',
        name: 'agent.maxMemory',
        message: 'How much memory (in megabytes) should be allocated to the agent?',
        default: () => process.env.maxMemory || '2048',
        validate: validateNumberAndNonZero,
        formatOrder: 2,
        formatString: '-m ${this.agent.maxMemory}M -e PROCESS_MAX_MEMORY_SIZE_MB=${this.agent.maxMemory} '
      },
      {
        type: 'list',
        name: 'agent.integrationType',
        message: 'Which information system will the agent ingest data from?',
        choices: getIntegrationTypes(),
        default: () => process.env.integrationType,
        formatOrder: 3,
        formatString: '-e INTEGRATION_TYPE=${this.agent.integrationType} '
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
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => (process.env.dbEndpoint || '').replace(/"/g, ''),
        validate: validateNotEmptyString,
        formatOrder: 6,
        formatString: '${"-e " + this.agent.database + "_ENDPOINT=\'" + this.agent.dbEndpoint + "\' "}'
      },
      {
        type: 'input',
        name: 'agent.dbUser',
        message: 'Enter database user:',
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => process.env.dbUser || '',
        validate: validateNotEmptyString,
        formatOrder: 7,
        formatString: '${"-e " + this.agent.database + "_USER=\'" + this.agent.dbUser + "\' "}'
      },
      {
        type: 'password',
        name: 'agent.dbPassword',
        message: 'Enter database users password:',
        when: (answers: inquirer.Answers) => answers.agent.mode !== 'preview',
        default: () => process.env.dbPassword || '',
        validate: validateNotEmptyString,
        formatOrder: 8,
        formatString: '${"-e " + this.agent.database + "_PASSWORD=\'" + this.agent.dbPassword + "\' "}'
      },
      {
        type: 'input',
        name: 'agent.image',
        message: 'Enter an agent docker image tag to use (use default for production):',
        default: () => process.env.image || 'adastradev/data-ingestion-agent:latest',
        validate: validateNotEmptyString,
        formatOrder: 15,
        formatString: '${(this.agent.image || "adastradev/data-ingestion-agent:latest")} '
      },
      {
        type: 'list',
        name: 'agent.network',
        message: 'Enter the docker network to use (bridge works in most cases):',
        choices: [
          { name: 'bridge', value: 'bridge', short: 0 },
          { name: 'host', value: 'host', short: 1 },
          { name: 'custom', value: 'custom', short:  2}
        ],
        default: () => process.env.network || 'bridge',
        formatOrder: 14,
        formatString: '--network=${(this.agent.networkCustom || this.agent.network || "bridge")} '
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
          { name: 'All', value: 'silly', short: 5 }
        ],
        default: () => process.env.logLevel || 'info',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        formatOrder: 9,
        formatString: '-e LOG_LEVEL=${this.agent.logLevel || "info"} '
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
        validate: validateNotEmptyString,
        formatOrder: 10,
        formatString: '-e DISCOVERY_SERVICE=\'${this.agent.discoverySvcUri}\' '
      },
      {
        type: 'input',
        name: 'agent.defaultStage',
        message: 'Enter the alternative default stage:',
        default: () => process.env.defaultStage || process.env.DEFAULT_STAGE || 'prod',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString,
        formatOrder: 11,
        formatString: '-e DEFAULT_STAGE=${this.agent.defaultStage} '
      },
      {
        type: 'input',
        name: 'agent.awsRegion',
        message: 'Enter the alternative AWS region:',
        default: () => process.env.awsRegion || process.env.AWS_REGION || 'us-east-1',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        validate: validateNotEmptyString,
        formatOrder: 12,
        formatString: '-e AWS_REGION=${this.agent.awsRegion} '
      },
      {
        type: 'number',
        name: 'agent.concurrentConnections',
        message: 'Enter the maximum number of concurrent database connections allowed:',
        validate: validateNumberAndNonZero,
        default: () => process.env.concurrentConnections || process.env.CONCURRENT_CONNECTIONS || '5',
        when: (answers: inquirer.Answers) => answers.agent.advancedMode,
        formatOrder: 13,
        formatString: '-e CONCURRENT_CONNECTIONS=${this.agent.concurrentConnections} '
      },
      {
        type: 'confirm',
        name: 'agent.confirmedAccurate',
        message: 'Are all of the entered values correct?',
        formatOrder: 16,
        formatString: '${this.agent.mode}'
      }
    ],

  apply: async (prompts: inquirer.Question[], answers: inquirer.Answers): Promise<boolean> => {
    const promptsWithFormats = prompts.filter((p) => p.formatOrder && p.formatString);
    const elements = [];
    for (const q of orderBy(promptsWithFormats, ['formatOrder'], ['asc'])) {
      if (q.when) {
        // tslint:disable-next-line: ban-types
        const shouldDisplay: boolean = (q.when.valueOf() as Function)(answers);
        if (shouldDisplay) {
          elements.push(fillTemplate(q.formatString, answers));
        }
      } else {
        elements.push(fillTemplate(q.formatString, answers));
      }
    }

    const cmd = `docker run ${elements.join('')}`;
    logCommand('(Windows) Command Prompt', cmd.replace(/\'/g, '"'));
    logCommand('(Windows) Powershell', cmd);
    logCommand('(Linux/Mac) bash', cmd);
    return false;
  }
} as ICommandConfig;
