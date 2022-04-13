import path from "path"

export const isSubPath = (parent: string, child: string) => {
  return !path.relative(parent, child).startsWith('.')
}