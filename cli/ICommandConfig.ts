import inquirer = require('inquirer');

export interface ICommandConfig {
  successMessages: string[];
  prompts: inquirer.Question[];
  apply(prompts: inquirer.Question[], answers: inquirer.Answers): Promise<boolean>;
}

declare module 'inquirer' {
  // tslint:disable-next-line: interface-name
  interface Question {
    formatString?: string;
    formatOrder?: number;
  }
}
