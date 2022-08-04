import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import path from 'path';
import chalk from 'chalk';

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      root: '..',
      type: 'file-tree-selection',
      name: 'files',
      message: 'choose files',
      multiple: true,
      validate: (input) => {
        const name = input.split(path.sep).pop();
        return name[0] !== '.';
      },
      transformer: (input) => {
        const name = input.split(path.sep).pop();
        if (name[0] == ".") {
          return chalk.grey(name);
        }
        return name;
      }
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });