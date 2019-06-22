## Inquirer File Tree Selection Prompt

## Install
```
npm install inquirer-file-tree-selection-prompt
```

## Usage
```
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer.prompt({
  type: 'file-tree-selection',
  ...
})
```

## Options
Takes type, name, message[filter, validate, default, pageSize, onlyShowDir] properties.
The extra options that this plugin provides are:
- `onlyShowDir`:  (Boolean) if true, will only show directory. Default: false.

## Example
```
const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('inquirer-file-tree-selection-prompt')

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'file'
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });
```