import { describe, expect, it } from 'vitest';
import { computeTextStats } from './Tool';

describe('computeTextStats', () => {
  it('counts empty', () => {
    expect(computeTextStats('').chars).toBe(0);
  });

  it('counts mixed text', () => {
    const s = computeTextStats('Hello 世界\nA1');
    expect(s.lines).toBe(2);
    expect(s.chinese).toBe(2);
    expect(s.asciiLetters).toBe(6);
    expect(s.digits).toBe(1);
  });
});
