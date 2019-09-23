import WizardCommand from './Wizard';
import ScheduleCommand from './Schedule';
import { ICommandConfig } from './ICommandConfig';

export interface ICommands {
  [commandName: string]: ICommandConfig;
}

export default {
  wizard: WizardCommand,
  schedule: ScheduleCommand
} as ICommands;
