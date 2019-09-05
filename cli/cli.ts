import * as inquirer from 'inquirer';
import commands from './commands';
import { ICommandConfig } from './ICommandConfig';

const fillTemplate = (template, inputs): string => {
  return new Function('return `' + template + '`;').call(inputs);
};

/**
 * Handles any configuration commands that have been specified
 *
 * @export
 * @param {string[]} procArgs Args passed to the agent (e.g. gencmd, ingest, preview etc)
 * @returns {Promise<boolean>} Whether or not the agent process should continue to be initiated or not
 */
export default async function (procArgs: string[]): Promise<boolean> {
  if (procArgs.length > 0 && commands[procArgs[0]]) {
    const commandConfig: ICommandConfig = commands[procArgs[0]];
    const answers = await inquirer.prompt(commandConfig.prompts);
    console.log('Copy and paste the following command to run the ingestion agent:');
    console.log('------');
    console.log(fillTemplate(commandConfig.formatString, answers));

    // We handled a command that should result in an immediate exit
    return false;
  } else {
     // No commands were found to be handled by this function, so continue starting up the agent
    return true;
  }
}
