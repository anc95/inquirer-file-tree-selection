const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('../index')

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'v'
    }
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
  });