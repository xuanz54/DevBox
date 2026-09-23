import { describe, expect, it } from 'vitest';
import { cryptoRandomInt, pickRandom, shuffle, splitOptions } from './core';

describe('random', () => {
  it('splits newline and comma options', () => {
    expect(splitOptions('a\nb\n c ')).toEqual(['a', 'b', 'c']);
    expect(splitOptions('a,b，c；d、e')).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(splitOptions('   ')).toEqual([]);
  });

  it('picks within range deterministically', () => {
    for (let i = 0; i < 200; i++) {
      const r = cryptoRandomInt(5);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(5);
      expect(Number.isInteger(r)).toBe(true);
    }
  });

  it('returns one of the options', () => {
    const opts = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      const r = pickRandom(opts);
      expect(r.ok).toBe(true);
      if (r.ok) expect(opts).toContain(r.value);
    }
  });

  it('rejects empty options', () => {
    expect(pickRandom([]).ok).toBe(false);
  });

  it('shuffles preserving elements', () => {
    const src = ['a', 'b', 'c', 'd'];
    const s = shuffle(src);
    expect(s).toHaveLength(src.length);
    expect([...s].sort()).toEqual([...src].sort());
  });
});