import { isSubPath } from '../src/utils.js';

describe('isSubPath', () => {
  it('should return true when parent is a direct ancestor', () => {
    expect(isSubPath('/foo/bar', '/foo/bar/baz')).toBe(true);
  });

  it('should return false when paths diverge', () => {
    expect(isSubPath('/foo/bar', '/foo/baz')).toBe(false);
  });

  it('should return true when paths are identical', () => {
    expect(isSubPath('/foo/bar', '/foo/bar')).toBe(true);
  });
});
