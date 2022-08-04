import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'

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