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
      pageSize: 5,
      validate: (item) => {
        const name = item.split(path.sep).pop();
        if (name[0] != ".") {
          return "please select another file"
        }
        return true;
      },
      // onlyShowValid: true,
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });