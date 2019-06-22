## Inquirer File Tree Selection Prompt

### QuickDemo
![QuickDemo]('./example/screenshot.gif)

### Install
```
npm install inquirer-file-tree-selection-prompt
```

### Usage
```
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer.prompt({
  type: 'file-tree-selection',
  ...
})
```

### Options
Takes type, name, message[filter, validate, default, pageSize, onlyShowDir, root] properties.
The extra options that this plugin provides are:
- `onlyShowDir`:  (Boolean) if true, will only show directory. Default: false.
- `root`: (String) it is the root of file tree. Default: process.cwd().

### Example
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