import { describe, expect, it } from 'vitest';
import { convertRadix } from './core';

describe('convertRadix', () => {
  it('dec to hex', () => {
    const r = convertRadix('255', 10, 16);
    expect(r).toEqual({ ok: true, value: 'ff' });
  });

  it('hex to bin', () => {
    const r = convertRadix('A', 16, 2);
    expect(r).toEqual({ ok: true, value: '1010' });
  });

  it('supports bigint', () => {
    const r = convertRadix('999999999999999999999999', 10, 16);
    expect(r.ok).toBe(true);
    if (r.ok) expect(BigInt(`0x${r.value}`)).toBe(BigInt('999999999999999999999999'));
  });

  it('rejects bad digit for radix', () => {
    expect(convertRadix('2', 2, 10).ok).toBe(false);
    expect(convertRadix('', 10, 16).ok).toBe(false);
  });
});
