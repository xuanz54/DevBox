import { describe, expect, it } from 'vitest';
import { convertUnit, findUnit, formatUnitResult, unitCategories } from './core';

describe('unit', () => {
  it('categories cover all defaults', () => {
    for (const cat of unitCategories) {
      expect(cat.units.length).toBeGreaterThan(1);
    }
  });

  it('converts length', () => {
    const r = convertUnit('length', 1, 'km', 'm');
    expect(r).toEqual({ ok: true, value: 1000 });
  });

  it('converts weight with 斤', () => {
    const r = convertUnit('weight', 1, 'jin', 'g');
    expect(r).toEqual({ ok: true, value: 500 });
  });

  it('converts temperature special formulas', () => {
    const toF = convertUnit('temperature', 100, 'c', 'f');
    expect(toF).toEqual({ ok: true, value: 212 });
    const toC = convertUnit('temperature', 32, 'f', 'c');
    if (!toC.ok) throw new Error(toC.error);
    expect(toC.value).toBeCloseTo(0, 5);
    const toK = convertUnit('temperature', 0, 'c', 'k');
    if (!toK.ok) throw new Error(toK.error);
    expect(toK.value).toBeCloseTo(273.15, 5);
  });

  it('converts data binary vs decimal', () => {
    const mibToKib = convertUnit('data', 1, 'mib', 'kib');
    expect(mibToKib).toEqual({ ok: true, value: 1024 });
    const r = convertUnit('data', 1, 'gb', 'mib');
    if (!r.ok) throw new Error(r.error);
    expect(r.value).toBeCloseTo(953.67431640625, 6);
  });

  it('rejects bad category/unit and non finite values', () => {
    expect(convertUnit('nope', 1, 'm', 'km').ok).toBe(false);
    expect(convertUnit('length', 1, 'm', 'kg').ok).toBe(false);
    expect(convertUnit('length', Number.NaN, 'm', 'km').ok).toBe(false);
    expect(convertUnit('length', Number.POSITIVE_INFINITY, 'm', 'km').ok).toBe(false);
  });

  it('finds units', () => {
    expect(findUnit('length', 'm')?.symbol).toBe('m');
    expect(findUnit('length', 'nope')).toBeNull();
  });

  it('formats results nicely', () => {
    expect(formatUnitResult(1000)).toBe('1000');
    expect(formatUnitResult(0.25)).toBe('0.25');
    expect(formatUnitResult(0)).toBe('0');
    expect(formatUnitResult(1e-10)).toContain('e');
  });
});