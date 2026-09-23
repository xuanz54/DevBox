import { describe, expect, it } from 'vitest';
import {
  addToDate,
  diffDates,
  diffSummary,
  parseDateInput,
  toDateValue,
  weekdayName,
} from './core';

function d(input: string): Date {
  const r = parseDateInput(input);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe('date', () => {
  it('parses date only and datetime', () => {
    expect(parseDateInput('2024-01-01').ok).toBe(true);
    expect(parseDateInput('2024-01-01T10:30:00').ok).toBe(true);
    expect(parseDateInput('nope').ok).toBe(false);
    expect(parseDateInput('').ok).toBe(false);
  });

  it('calendars two month diff with day alignment', () => {
    const r = diffDates(d('2024-01-15'), d('2024-03-15'));
    expect(r.fromIsEarlier).toBe(true);
    expect(r.diff.years).toBe(0);
    expect(r.diff.months).toBe(2);
    expect(r.diff.days).toBe(0);
    expect(r.diff.totalDays).toBe(60);
    expect(r.diff.totalSeconds).toBe(60 * 86400);
  });

  it('handles month-end overflow (Jan 31 + 1 month = Feb 29)', () => {
    const added = addToDate(d('2024-01-31'), 1, 'month');
    expect(toDateValue(added)).toBe('2024-02-29');
    const r = diffDates(d('2024-01-31'), d('2024-02-29'));
    expect(r.diff.months).toBe(1);
    expect(r.diff.days).toBe(0);
  });

  it('orders inputs regardless of argument order', () => {
    const r = diffDates(d('2026-01-01'), d('2025-01-01'));
    expect(r.fromIsEarlier).toBe(false);
    expect(r.diff.years).toBe(1);
  });

  it('adds days/weeks/years', () => {
    expect(toDateValue(addToDate(d('2024-01-15'), 7, 'day'))).toBe('2024-01-22');
    expect(toDateValue(addToDate(d('2024-01-15'), 1, 'week'))).toBe('2024-01-22');
    expect(toDateValue(addToDate(d('2024-02-29'), 1, 'year'))).toBe('2025-02-28');
  });

  it('reports weekday in chinese', () => {
    expect(weekdayName(d('2024-01-01'))).toBe('星期一');
  });

  it('summarizes diff', () => {
    const r = diffDates(d('2024-01-01'), d('2024-04-11'));
    expect(diffSummary(r.diff)).toContain('3 个月');
    expect(diffSummary(r.diff)).toContain('10 天');
  });
});