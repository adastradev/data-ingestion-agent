import inquirer = require("inquirer");

export interface ICommandConfig {
  successMessages: string[];
  prompts: inquirer.QuestionCollection[] | IWizardQuestion[];
  apply(prompts: Array<inquirer.QuestionCollection<inquirer.Answers>> | IWizardQuestion[], answers: inquirer.Answers): boolean | Promise<boolean>;
}

export interface IWizardQuestion extends inquirer.Question {
  formatString?: string;
  formatOrder?: number;
}
