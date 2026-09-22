import { describe, expect, it } from 'vitest';
import { dateToTimestamp, detectPrecision, formatTimestamp, parseTimestampInput } from './core';

describe('timestamp', () => {
  it('detects precision', () => {
    expect(detectPrecision(1700000000)).toBe('s');
    expect(detectPrecision(1700000000000)).toBe('ms');
  });

  it('formats seconds', () => {
    const r = formatTimestamp(0, 's');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.iso).toBe('1970-01-01T00:00:00.000Z');
  });

  it('parses numeric input', () => {
    expect(parseTimestampInput('1700000000')).toEqual({ ok: true, value: 1700000000 });
    expect(parseTimestampInput('abc').ok).toBe(false);
  });

  it('converts date to timestamp', () => {
    const r = dateToTimestamp('2020-01-01T00:00:00.000Z', 's');
    expect(r).toEqual({ ok: true, value: 1577836800 });
  });
});
