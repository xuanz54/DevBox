import { describe, expect, it } from 'vitest';
import { convertCase, splitWords } from './Tool';

describe('case', () => {
  it('splits words', () => {
    expect(splitWords('helloWorld_test-case')).toEqual([
      'hello',
      'World',
      'test',
      'case',
    ]);
  });

  it('converts styles', () => {
    expect(convertCase('hello world', 'camel')).toBe('helloWorld');
    expect(convertCase('hello world', 'pascal')).toBe('HelloWorld');
    expect(convertCase('HelloWorld', 'snake')).toBe('hello_world');
    expect(convertCase('hello world', 'kebab')).toBe('hello-world');
    expect(convertCase('hello world', 'constant')).toBe('HELLO_WORLD');
    expect(convertCase('hello world', 'title')).toBe('Hello World');
  });
});
