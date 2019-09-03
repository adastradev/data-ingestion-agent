import ICommand from './ICommand';
import { inject, injectable } from 'inversify';
import TYPES from '../../ioc.types';
import { SQS } from 'aws-sdk';
import SendDataMessage from '../Messages/SendDataMessage';
import { Logger } from 'winston';
import * as readline from 'readline-promise';

/**
 * Prompts the user to input required fields to produce a valid docker command to run the ingestion agent.
 *
 * @export
 * @class GenerateAdHocIngestCommand
 * @implements {ICommand}
 */
@injectable()
export default class GenerateCommand implements ICommand {
    constructor(@inject(TYPES.Logger) private _logger: Logger) {
    }

    public async invoke() {
      const rlp = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const whatAnswer = await rlp.questionAsync('What?');
      const what2Answer = await rlp.questionAsync('What again?');
      this._logger.debug(`what answer: ${whatAnswer}`);
      this._logger.debug(`what answer 2: ${what2Answer}`);
    }
}
