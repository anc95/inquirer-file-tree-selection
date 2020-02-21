const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('../index')
const path = require('path');
const chalk = require('chalk');

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'file',
      message: 'choose a file',
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