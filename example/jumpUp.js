const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('../dist/index')
const path = require('path');
const chalk = require('chalk');

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'file',
      message: 'choose a file',
      enableGoUpperDirectory: true
    },
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });