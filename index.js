'use strict';
/**
 * `file-tree-slection` type prompt
 */

const _ = require('lodash');
const chalk = require('chalk');
const figures = require('figures');
const cliCursor = require('cli-cursor');
const path = require('path');
const fs = require('fs');
const dirTree = require('directory-tree');
const { fromEvent } = require('rxjs');
const { filter, share, flatMap, map, take, takeUntil } = require('rxjs/operators');
const Base = require('inquirer/lib/prompts/base');
const observe = require('inquirer/lib/utils/events');
const Paginator = require('inquirer/lib/utils/paginator');

/**
 * type: string
 * onlyShowDir: boolean (default: false)
 */
class FileTreeSelectionPrompt extends Base {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);

    const root = path.resolve(process.cwd(), this.opt.root || '.');
    const rootNode = {
      path: root,
      type: 'directory',
      name: '.(root directory)',
      _rootNode: true
    }

    this.fileTree = {
      children: [rootNode]
    };    

    this.shownList = []

    this.firstRender = true;

    this.opt = {
      ...{
        default: null,
        pageSize: 10,
        onlyShowDir: false,
        multiple: false
      },
      ...this.opt
    }

    // Make sure no default is set (so it won't be printed)
    this.opt.default = null;
    this.selectedList = [];
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

    var validation = this.handleSubmitEvents(events.line.pipe(map(() => this.active.path)));
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
      .forEach(this.onSpaceKey.bind(this, false));

    function normalizeKeypressEvents(value, key) {
      return { value: value, key: key || {} };
    }
    fromEvent(this.rl.input, 'keypress', normalizeKeypressEvents)
      .pipe(filter(({ key }) => key && key.name === 'tab'), share())
      .pipe(takeUntil(validation.success))
      .forEach(this.onSpaceKey.bind(this, true));

    cliCursor.hide();
    if (this.firstRender) {
      const rootNode = this.fileTree.children[0];

      await this.prepareChildren(rootNode);
      rootNode.open = true;
      if (this.opt.hideRoot) {
        this.fileTree.children = rootNode.children;
        this.active = this.fileTree.children[0];
      } else {
        this.active = rootNode.children[0];
      }
      this.render();
    }

    return this;
  }

  renderFileTree(root = this.fileTree, indent = 2) {
    const children = root.children || []
    let output = ''
    const transformer = this.opt.transformer;
    const isFinal = this.status === 'answered';
    let showValue;

    children.forEach(itemPath => {
      if (this.opt.onlyShowDir && itemPath.type !== 'directory') {
        return
      }

      this.shownList.push(itemPath)
      let prefix = itemPath.children
        ? itemPath.open
          ? figures.arrowDown + ' '
          : figures.arrowRight + ' '
        : itemPath === this.active
          ? figures.play + ' '
          : ''

      // when multiple is true, add radio icon at prefix
      if (this.opt.multiple) {
        prefix += this.selectedList.includes(itemPath.path) ? figures.radioOn : figures.radioOff;
        prefix += ' ';
      }
      const safeIndent = (indent - prefix.length + 2) > 0
        ? indent - prefix.length + 2
        : 0 ;
      if (transformer) {
        const transformedValue = transformer(itemPath.path, this.answers, { isFinal });
        showValue = ' '.repeat(safeIndent) + prefix + transformedValue + '\n';
      } else {
        showValue = ' '.repeat(safeIndent) + prefix + itemPath.name + (itemPath.type === 'directory' ? path.sep : '')  + '\n'
      }

      if (itemPath === this.active && itemPath.isValid) {
        output += chalk.cyan(showValue)
      }
      else if (itemPath === this.active && !itemPath.isValid) {
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

  async prepareChildren(node) {
    const parentPath = node.path;

    if (!fs.lstatSync(parentPath).isDirectory() || node.children || node.open === true) {
      return;
    }

    try {
      const children = fs.readdirSync(parentPath, {withFileTypes: true}).map(item => {
        return {
          type: item.isDirectory() ? 'directory' : 'file',
          name: item.name,
          path: path.resolve(parentPath, item.name)
        }
      });
  
      node.children = children;
    } catch (e) { 
      // maybe for permission denied, we cant read the dir
      // do nothing here  
    }

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
      await addValidity(node);
    }

    !node._rootNode && this.render();
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
      message += chalk.cyan(this.opt.multiple ? this.selectedList.join(', ') : this.active.path)
    }
    else {
      this.shownList = []
      const fileTreeStr = this.renderFileTree()
      message += '\n' + this.paginator.paginate(fileTreeStr + '----------------', this.shownList.indexOf(this.active), this.opt.pageSize);
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
    this.done(this.opt.multiple ? this.selectedList :state.value);
  }

  moveActive(distance = 0) {
    const currentIndex = this.shownList.indexOf(this.active)
    let index = currentIndex + distance

    if (index >= this.shownList.length) {
      index = 0
    }
    else if (index < 0) {
      index = this.shownList.length - 1
    }

    this.active = this.shownList[index]
    this.prepareChildren(this.active);
    this.render()
  }

  /**
   * When user press a key
   */
  onUpKey() {
    this.moveActive(-1)
  }

  onDownKey() {
    this.moveActive(1)
  }

  onSpaceKey(tirggerByTab = false) {
    if (!tirggerByTab && this.opt.multiple) {
      if (this.active.isValid === false) {
        return
      }

      if (this.selectedList.includes(this.active.path)) {
        this.selectedList.splice(this.selectedList.indexOf(this.active.path), 1);
      }
      else {
        this.selectedList.push(this.active.path);
      }

      this.render()
      return
    }

    if (this.active.children && this.active.children.length === 0) {
      return
    }

    this.active.open = !this.active.open
    this.render()
  }
}

module.exports = FileTreeSelectionPrompt;
