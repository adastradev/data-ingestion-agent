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
    'WARNING: All times are Eastern Standard Time. Please adjust your ',
    'schedule accordingly.',
    'For more information on cron expressions see:',
    'https://en.wikipedia.org/wiki/Cron',
    '----------------------------------------------------------------------',
    ''
  ],
  prompts: [
      {
        type: 'list',
        name: 'agent.manageOption',
        message: 'What would you like to do?',
        choices: [
          { name: 'List existing schedules', value: 'list', short: 0 },
          { name: 'Add a Schedule', value: 'add', short: 1 },
          { name: 'Update an existing Schedule', value: 'update', short: 2 },
          { name: 'Delete an existing Schedule', value: 'delete', short: 3 }
        ],
        default: () => 'add'
      },
      {
        type: 'input',
        name: 'agent.astraUserName',
        message: 'Enter your Astra Cloud user name:',
        default: () => process.env.astraUserName || '',
        validate: validateNotEmptyString
      },
      {
        type: 'password',
        name: 'agent.astraUserPassword',
        message: 'Enter your Astra Cloud password:',
        default: () => process.env.astraUserPassword || '',
        validate: validateNotEmptyString
      },
      {
        type: 'input',
        name: 'agent.expression',
        message: 'Enter the cron expression to define the new schedule (defaults to once per day at midnight (EST)):',
        when: (answers: inquirer.Answers) => answers.agent.manageOption === 'add',
        default: () => '0 0 * * *',
        validate: validateNotEmptyString
      },
      {
        type: 'confirm',
        name: 'agent.confirmedAccurate',
        message: 'Are all of the entered values correct?'
      }
    ],

  apply: async (prompts: inquirer.Question[], answers: inquirer.Answers): Promise<boolean> => {
    // TODO: Call svc
    console.log('Schedule created!');

    return false;
  }
} as ICommandConfig;
