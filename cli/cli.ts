// tslint:disable: no-string-literal
import * as inquirer from 'inquirer';
import commands from './commands';
import { ICommandConfig } from './ICommandConfig';

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
    let confirmed: boolean;
    let answers: inquirer.Answers;
    do {
      answers = await inquirer.prompt(commandConfig.prompts);

      confirmed = answers.agent.confirmedAccurate;

      if (!confirmed) {
        // Save answers for next attempt
        for (const key of Object.keys(answers.agent)) {
          process.env[key] = answers.agent[key];
        }
      }
    } while (!confirmed);

    for (const msg of commandConfig.successMessages) {
      console.log(msg);
    }

    const contd = await commandConfig.apply(commandConfig.prompts, answers);

    // We handled a command that should result in an immediate exit
    return contd;
  } else {
     // No commands were found to be handled by this function, so continue starting up the agent
    return true;
  }
}
