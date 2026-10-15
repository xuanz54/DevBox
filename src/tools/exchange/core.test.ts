import { describe, expect, it } from 'vitest';
import {
  CURRENCIES,
  FX_STALE_HOURS,
  convert,
  findCurrency,
  formatMoney,
  formatRate,
  isCacheStale,
  normalizeRates,
  parseAmount,
  parseSnapshot,
  unitRate,
} from './core';

const rates = normalizeRates('USD', { USD: 1, EUR: 0.9, CNY: 7, JPY: 150 });

describe('exchange core', () => {
  it('currency list has unique codes and Chinese names', () => {
    const codes = CURRENCIES.map((cur) => cur.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const cur of CURRENCIES) {
      expect(cur.name.length).toBeGreaterThan(0);
      expect(cur.decimals).toBeGreaterThanOrEqual(0);
    }
  });

  it('findCurrency resolves known codes', () => {
    expect(findCurrency('CNY')?.name).toBe('人民币');
    expect(findCurrency('XXX')).toBeUndefined();
  });

  it('normalizeRates injects base = 1', () => {
    expect(rates.USD).toBe(1);
    expect(rates.CNY).toBe(7);
  });

  it('converts across currencies via base rates', () => {
    const r = convert(100, 'USD', 'CNY', rates);
    expect(r).toEqual({ ok: true, value: 700 });
  });

  it('converts reverse direction', () => {
    const r = convert(700, 'CNY', 'USD', rates);
    expect(r).toEqual({ ok: true, value: 100 });
  });

  it('same currency is identity', () => {
    const r = convert(42.5, 'EUR', 'EUR', rates);
    expect(r).toEqual({ ok: true, value: 42.5 });
  });

  it('allows zero and negative amounts', () => {
    expect(convert(0, 'USD', 'CNY', rates)).toEqual({ ok: true, value: 0 });
    expect(convert(-10, 'USD', 'CNY', rates)).toEqual({ ok: true, value: -70 });
  });

  it('rejects missing currency data', () => {
    const r = convert(1, 'USD', 'XXX', rates);
    expect(r.ok).toBe(false);
  });

  it('rejects non-finite amounts', () => {
    expect(convert(NaN, 'USD', 'CNY', rates).ok).toBe(false);
    expect(convert(Infinity, 'USD', 'CNY', rates).ok).toBe(false);
  });

  it('unitRate equals convert with amount 1', () => {
    const r = unitRate('USD', 'JPY', rates);
    expect(r).toEqual({ ok: true, value: 150 });
  });

  it('parseAmount accepts numbers and rejects junk', () => {
    expect(parseAmount(' 12.5 ')).toEqual({ ok: true, value: 12.5 });
    expect(parseAmount('-3')).toEqual({ ok: true, value: -3 });
    expect(parseAmount('').ok).toBe(false);
    expect(parseAmount('abc').ok).toBe(false);
    expect(parseAmount('1,000').ok).toBe(false);
  });

  it('formatMoney respects currency decimals', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('1,234.50');
    expect(formatMoney(1234.5, 'JPY')).toBe('1,235');
    expect(formatMoney(1234.5, 'XYZ')).toBe('1,234.50');
  });

  it('formatRate adapts precision', () => {
    expect(formatRate(6.7)).toBe('6.7000');
    expect(formatRate(150)).toBe('150.00');
    expect(formatRate(0.000123)).toBe('0.000123');
    expect(formatRate(NaN)).toBe('—');
  });

  it('isCacheStale compares against max age', () => {
    const t0 = 1_000_000;
    expect(isCacheStale(t0, t0 + 1000)).toBe(false);
    expect(isCacheStale(t0, t0 + FX_STALE_HOURS * 3600_000 + 1)).toBe(true);
    expect(isCacheStale(0, t0)).toBe(true);
  });

  it('parseSnapshot validates cached JSON', () => {
    const good = JSON.stringify({
      base: 'USD',
      date: '2026-10-14',
      rates: { USD: 1, CNY: 7 },
      fetchedAt: 123,
    });
    const r = parseSnapshot(good);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.base).toBe('USD');
    expect(r.value.rates.CNY).toBe(7);

    expect(parseSnapshot(null).ok).toBe(false);
    expect(parseSnapshot('not json').ok).toBe(false);
    expect(parseSnapshot('{"base":1}').ok).toBe(false);
    expect(
      parseSnapshot(
        JSON.stringify({ base: 'USD', date: 'd', rates: { CNY: 'x' }, fetchedAt: 1 }),
      ).ok,
    ).toBe(true);
  });
});
