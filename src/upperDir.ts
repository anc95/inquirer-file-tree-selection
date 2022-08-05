import path from 'path'
import { Node } from './types.js'

const getParentDir = (dir: string) => {
  return path.dirname(dir)
}

export const getUpperDirNode = (dir: string) => {
  const parentDir = getParentDir(dir)

  const parentNode: Node = {
    name: '..',
    path: parentDir,
    type: 'directory',
    isValid: true
  }

  return parentNode
}

export const gotoUpperDir = (upperDir: Node, currentRootNode: Node) => {
  currentRootNode._rootNode = false
  upperDir._rootNode = true
}