## Inquirer File Tree Selection Prompt

### QuickDemo
![QuickDemo](./example/screenshot.gif)

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
Takes `type`, `name`, `message`, [`filter`, `validate`, `transformer`, `default`, `pageSize`, `onlyShowDir`, `onlyShowValid`, `hideChildrenOfValid`, `root`, `hideRoot`, `multiple`] properties.
The extra options that this plugin provides are:
- `onlyShowDir`:  (Boolean) if true, will only show directory. Default: false.
- `root`: (String) it is the root of file tree. Default: process.cwd(). 
- `onlyShowValid`: (Boolean) if true, will only show valid files (if `validate` is provided). Default: false.
- `hideChildrenOfValid`: (Boolean) if true, will hide children of valid directories (if `validate` is provided). Default: false.
- `transformer`: (Function) a hook function to transform the display of directory or file name.
- `multiple`: (Boolean) if true, will enable to select multiple files. Default: false.

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