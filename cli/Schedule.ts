import * as inquirer from 'inquirer';
import { ICommandConfig } from './ICommandConfig';
import { IntegrationType } from '../source/IIntegrationConfig';
import { BearerTokenCredentials, DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
import { CognitoUserPoolLocatorUserManagement } from '@adastradev/user-management-sdk';
import { CustomAuthManager } from '../source/Auth/CustomAuthManager';
import getCloudDependencies from '../source/Util/getCloudDependencies';
import { DataIngestionApi } from '@adastradev/data-ingestion-sdk';
import { DefaultHttpClientProvider } from '../source/Util/DefaultHttpClientProvider';

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
    'schedule configuration accordingly.',
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
      /* ADD questions */
      {
        type: 'input',
        name: 'agent.expression',
        message: 'Enter the cron expression to define the new schedule (defaults to once per day at midnight (EST)):',
        when: (answers: inquirer.Answers) => answers.agent.manageOption === 'add',
        default: () => '0 0 * * *',
        validate: validateNotEmptyString
      },
      /* LIST questions */
      /* DELETE questions */
      {
        type: 'input',
        name: 'agent.deleteName',
        message: 'Enter the name of the scheduled event to delete (use the list option to see all scheduled events):',
        when: (answers: inquirer.Answers) => answers.agent.manageOption === 'delete',
        validate: validateNotEmptyString
      },
      {
        type: 'confirm',
        name: 'agent.confirmedAccurate',
        message: 'Are all of the entered values correct?'
      }
    ],

  apply: async (prompts: inquirer.Question[], answers: inquirer.Answers): Promise<boolean> => {
    // Try Logon
    const cloudDependenciesMap: Map<any, any> = getCloudDependencies();
    const sdk: DiscoverySdk = new DiscoverySdk(process.env.DISCOVERY_SERVICE, process.env.AWS_REGION, process.env.DEFAULT_STAGE, null, cloudDependenciesMap);

    const poolLocator = new CognitoUserPoolLocatorUserManagement(process.env.AWS_REGION);
    const authManager = new CustomAuthManager(poolLocator, process.env.AWS_REGION);

    let endpoints;
    try {
        endpoints = await sdk.lookupService('user-management');
        process.env.USER_MANAGEMENT_URI = endpoints[0];
        console.log(process.env.USER_MANAGEMENT_URI);
    } catch (error) {
        console.error('Failed to find the user management service via the lookup service');
        throw error;
    }

    try {
        endpoints = await sdk.lookupService('data-ingestion');
        process.env.DATA_INGESTION_URI = endpoints[0];
        console.log(process.env.DATA_INGESTION_URI);
    } catch (error) {
        console.error('Failed to find the data ingestion service via the lookup service');
        throw error;
    }

    console.log('authManager.signIn');
    let cognitoSession;
    try {
        cognitoSession = await authManager.signIn(answers.agent.astraUserName, answers.agent.astraUserPassword);
    } catch (error) {
        console.error('Failed to sign in, please confirm the specified user exists and is in a valid state');
        throw error;
    }

    console.log('authManager.refreshCognitoCredentials()');
    try {
        await authManager.refreshCognitoCredentials();
    } catch (error) {
        console.error('Failed to get authentication keys, please confirm the specified user exists and is in a valid state');
        throw error;
    }

    // lookup SQS queue for this tenant
    const credentialsBearerToken: BearerTokenCredentials = {
        idToken: cognitoSession.getIdToken().getJwtToken(),
        type: 'BearerToken'
    };
    const dataIngestionApi = new DataIngestionApi(
        process.env.DATA_INGESTION_URI,
        process.env.AWS_REGION,
        credentialsBearerToken);

    const httpClientProvider = new DefaultHttpClientProvider();

    switch (answers.agent.manageOption) {
      case 'add':
        console.log('Schedule created!');
        // dataIngestionApi.createSchedule(answers.agent.expression);
        break;
      case 'delete':
        console.log('Deleted!');
        // dataIngestionApi.deleteSchedule(answers.agent.deleteName);
        break;
      case 'list':
        console.log('Listing!');
        // dataIngestionApi.getSchedules();
      default:
        console.log('Unknown option selected, exiting');
        break;
    }

    return false;
  }
} as ICommandConfig;
