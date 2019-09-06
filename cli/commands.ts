import WizardCommand from './Wizard';
import { ICommandConfig } from './ICommandConfig';

export interface ICommands {
  [commandName: string]: ICommandConfig;
}

export default {
  wizard: WizardCommand
} as ICommands;
