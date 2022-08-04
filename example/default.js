import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import path from 'path';
import chalk from 'chalk';
import * as url from 'node:url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

inquirer
  .prompt([
    {
      type: 'file-tree-selection',
      name: 'file',
      default: __filename,
      message: 'choose a file',
      transformer: (input) => {
        const name = input.split(path.sep).pop();
        if (name[0] == ".") {
          return chalk.grey(name);
        }
        return name;
      }
    },
    {
        type: 'file-tree-selection',
        name: 'files',  
        default: [__filename],
        multiple: true,
        message: 'choose mutiple file',
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