const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('../index')

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'file',
      message: 'choose a file'
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });