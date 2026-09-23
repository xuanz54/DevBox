import { describe, expect, it } from 'vitest';
import { csvToJson, jsonToCsv } from './core';

describe('csv', () => {
  it('parses csv with header', () => {
    const r = csvToJson('a,b\n1,2\n3,4', ',', true);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value)).toEqual([
        { a: '1', b: '2' },
        { a: '3', b: '4' },
      ]);
    }
  });

  it('parses csv without header', () => {
    const r = csvToJson('a,b\n1,2', ',', false);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value)).toEqual([
        ['a', 'b'],
        ['1', '2'],
      ]);
    }
  });

  it('respects delimiter', () => {
    const r = csvToJson('a\tb\n1\t2', '\t', true);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value)).toEqual([{ a: '1', b: '2' }]);
    }
  });

  it('unparses json objects to csv', () => {
    const r = jsonToCsv(JSON.stringify([{ a: 1, b: 2 }, { a: 3, b: 4 }]), ',');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe('a,b\n1,2\n3,4');
    }
  });

  it('rejects empty and invalid input', () => {
    expect(csvToJson('   ', ',', true).ok).toBe(false);
    expect(jsonToCsv('not json', ',').ok).toBe(false);
    expect(jsonToCsv('"unclosed', ',').ok).toBe(false);
  });
});