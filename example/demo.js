const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('../index')

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'v',
      message:' cc'
    }
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
  });