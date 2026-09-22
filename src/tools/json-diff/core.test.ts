import { describe, expect, it } from 'vitest';
import { diffLines, prettyForDiff, summarizeDiff } from './core';

describe('diffLines', () => {
  it('detects identical', () => {
    const d = diffLines('a\nb', 'a\nb');
    expect(d).toEqual([
      { type: 'same', text: 'a' },
      { type: 'same', text: 'b' },
    ]);
  });

  it('detects add and del', () => {
    const d = diffLines('a\nb\nc', 'a\nx\nc');
    const sum = summarizeDiff(d);
    expect(sum.added).toBe(1);
    expect(sum.removed).toBe(1);
    expect(sum.same).toBe(2);
  });
});

describe('prettyForDiff', () => {
  it('pretty prints', () => {
    const r = prettyForDiff('{"a":1}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toContain('\n');
  });

  it('fails on bad json', () => {
    expect(prettyForDiff('nope').ok).toBe(false);
  });
});
