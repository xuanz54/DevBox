import { describe, expect, it } from 'vitest';
import { compressJson, formatJson, jsonTypeOf, parseJson } from './core';

describe('parseJson', () => {
  it('parses valid json', () => {
    const r = parseJson('{"a":1}');
    expect(r).toEqual({ ok: true, value: { a: 1 } });
  });

  it('rejects empty input', () => {
    expect(parseJson('   ')).toEqual({ ok: false, error: '输入为空' });
  });

  it('rejects invalid json', () => {
    const r = parseJson('{a:1}');
    expect(r.ok).toBe(false);
  });
});

describe('formatJson / compressJson', () => {
  it('formats with indent', () => {
    const r = formatJson('{"a":[1,2]}', { indent: 2 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
    }
  });

  it('compresses', () => {
    const r = compressJson('{\n  "a": 1\n}');
    expect(r).toEqual({ ok: true, value: '{"a":1}' });
  });
});

describe('jsonTypeOf', () => {
  it('classifies', () => {
    expect(jsonTypeOf(null)).toBe('null');
    expect(jsonTypeOf([1])).toBe('array');
    expect(jsonTypeOf('x')).toBe('string');
    expect(jsonTypeOf(1)).toBe('number');
  });
});
