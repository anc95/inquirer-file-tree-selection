import { getUpperDirNode } from '../src/upperDir.js';

describe('getUpperDirNode', () => {
  it('should return a node named ".."', () => {
    expect(getUpperDirNode('/current/dir').name).toBe('..');
  });

  it('should compute the correct parent path', () => {
    expect(getUpperDirNode('/current/dir').path).toBe('/current');
  });

  it('should mark the node as a directory', () => {
    expect(getUpperDirNode('/current/dir').type).toBe('directory');
  });

  it('should set isValid to true', () => {
    expect(getUpperDirNode('/current/dir').isValid).toBe(true);
  });
});
