'use strict';
/**
 * `file-tree-slection` type prompt
 */

const _ = require('lodash');
const chalk = require('chalk');
const figures = require('figures');
const cliCursor = require('cli-cursor');
const path = require('path');
const dirTree = require('directory-tree');
const { flatMap, map, take, takeUntil } = require('rxjs/operators');
const Base = require('inquirer/lib/prompts/base');
const observe = require('inquirer/lib/utils/events');
const Paginator = require('inquirer/lib/utils/paginator');
const fs = require('fs');

/**
 * type: string
 * onlyShowDir: boolean (default: false)
 */
class FileTreeSelectionPrompt extends Base {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);

    this.fileTree = dirTree(path.resolve(process.cwd(), this.opt.root || '.'))
    this.fileTree.children = this.fileTree.children || []

    this.fileTree.children.unshift({
      path: process.cwd(),
      type: 'directory',
      isCurrentDirectory: true,
      name: '.(current directory)'
    })

    this.shownList = []

    this.firstRender = true;
    this.selected = this.fileTree.children[0];

    this.opt = {
      ...{
        default: null,
        pageSize: 10,
        onlyShowDir: false
      },
      ...this.opt
    }

    // Make sure no default is set (so it won't be printed)
    this.opt.default = null;
    this.opt.pageSize = 10

    this.paginator = new Paginator(this.screen);
  }

  /**
   * Start the Inquiry session
   * @param  {Function} cb  Callback when prompt is done
   * @return {this}
   */

  async _run(cb) {
    this.done = cb;

    var self = this;

    var events = observe(this.rl);

    var validation = this.handleSubmitEvents(events.line.pipe(map(() => this.selected.path)));
    validation.success.forEach(this.onSubmit.bind(this));
    validation.error.forEach(this.onError.bind(this));

    events.normalizedUpKey
      .pipe(takeUntil(validation.success))
      .forEach(this.onUpKey.bind(this));
    events.normalizedDownKey
      .pipe(takeUntil(validation.success))
      .forEach(this.onDownKey.bind(this));
    events.spaceKey
      .pipe(takeUntil(validation.success))
      .forEach(this.onSpaceKey.bind(this));

    cliCursor.hide();
    if (this.firstRender) {
      const validate = this.opt.validate;
      if (validate) {
        const addValidity = async (fileObj) => {
          const isValid = await validate(fileObj.path);
          fileObj.isValid = false;
          if (isValid === true) {
            if (this.opt.onlyShowDir) {
              if (fileObj.type == 'directory') {
                fileObj.isValid = true;
              }
            } else {
              fileObj.isValid = true;
            }
          }
          if (fileObj.children) {
            if (this.opt.hideChildrenOfValid && fileObj.isValid) {
              fileObj.children.length = 0;
            }
            const children = fileObj.children.map(x => x);
            for (let index = 0, length = children.length; index < length; index++) {
              const child = children[index];
              await addValidity(child);
              if (child.isValid) {
                fileObj.hasValidChild = true;
              }
              if (this.opt.onlyShowValid && !child.hasValidChild && !child.isValid) {
                const spliceIndex = fileObj.children.indexOf(child);
                fileObj.children.splice(spliceIndex, 1);
              }
            }
          }
        }
        await addValidity(this.fileTree);
      }
      this.render();
    }

    return this;
  }

  renderFileTree(root = this.fileTree, indent = 2) {
    const children = root.children || []
    let output = ''

    children.forEach(itemPath => {
      if (this.opt.onlyShowDir && itemPath.type !== 'directory') {
        return
      }

      this.shownList.push(itemPath)
      let prefix = itemPath.children && itemPath.children.length
        ? itemPath.open
          ? figures.arrowDown + ' '
          : figures.arrowRight + ' '
        : ''
      const showValue = ' '.repeat(prefix ? indent - 2 : indent) + prefix + itemPath.name + '\n'

      if (itemPath === this.selected && itemPath.isValid) {
        output += chalk.cyan(showValue)
      }
      else if (itemPath === this.selected && !itemPath.isValid) {
        output += chalk.red(showValue)
      }
      else {
        output += showValue
      }

      if (itemPath.open) {
        output += this.renderFileTree(itemPath, indent + 2)
      }
    })

    return output
  }

  /**
   * Render the prompt to screen
   * @return {FileTreeSelectionPrompt} self
   */

  render(error) {
    // Render question
    var message = this.getQuestion();

    if (this.firstRender) {
      message += chalk.dim('(Use arrow keys, Use space to toggle folder)');
    }

    if (this.status === 'answered') {
      message += chalk.cyan(this.selected.path)
    }
    else {
      this.shownList = []
      const fileTreeStr = this.renderFileTree()
      message += '\n' + this.paginator.paginate(fileTreeStr + '-----------------', this.shownList.indexOf(this.selected), this.opt.pageSize)
    }

    let bottomContent;

    if (error) {
      bottomContent = '\n' + chalk.red('>> ') + error;
    }

    this.firstRender = false;
    this.screen.render(message, bottomContent);
  }

  onEnd(state) {
    this.status = 'answered';
    this.answer = state.value;

    // Re-render prompt
    this.render();

    this.screen.done();
    console.log(state.value);
    this.done(state.value);
  }

  onError(state) {
    this.render(state.isValid);
  }

  /**
   * When user press `enter` key
   */

  onSubmit(state) {
    this.status = 'answered';

    this.render();

    this.screen.done();
    cliCursor.show();
    this.done(state.value);
  }

  moveselected(distance = 0) {
    const currentIndex = this.shownList.indexOf(this.selected)
    let index = currentIndex + distance

    if (index >= this.shownList.length) {
      index = 0
    }
    else if (index < 0) {
      index = this.shownList.length - 1
    }

    this.selected = this.shownList[index]



    this.render()
  }

  /**
   * When user press a key
   */
  onUpKey() {
    this.moveselected(-1)
  }

  onDownKey() {
    this.moveselected(1)
  }

  onSpaceKey() {
    if (!this.selected.children) {
      return
    }

    this.selected.open = !this.selected.open
    this.render()
  }
}

module.exports = FileTreeSelectionPrompt;
