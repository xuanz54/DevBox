import { err, ok, type Result } from '../../lib/result';

export interface DateDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export interface DateDiffResult {
  fromIsEarlier: boolean;
  diff: DateDiff;
}

const DAY_MS = 86400000;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function parseDateInput(input: string): Result<Date, string> {
  const t = input.trim();
  if (!t) return err('日期不能为空');
  const m = DATE_ONLY.exec(t);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (Number.isNaN(dt.getTime())) return err('无法解析的日期');
    return ok(dt);
  }
  const dt = new Date(t);
  if (Number.isNaN(dt.getTime())) return err('无法解析的日期');
  return ok(dt);
}

function dayIndex(d: Date): number {
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY_MS);
}

function addCalendarMonths(d: Date, n: number): Date {
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + n, day);
  if (target.getDate() !== day) {
    target.setDate(0);
  }
  return target;
}

export function diffDates(a: Date, b: Date): DateDiffResult {
  let earlier = a;
  let later = b;
  let fromIsEarlier = true;
  if (b.getTime() < a.getTime()) {
    earlier = b;
    later = a;
    fromIsEarlier = false;
  }

  const ms = later.getTime() - earlier.getTime();
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(ms / DAY_MS);

  let months =
    (later.getFullYear() - earlier.getFullYear()) * 12 +
    (later.getMonth() - earlier.getMonth());
  let days = dayIndex(later) - dayIndex(addCalendarMonths(earlier, months));
  if (days < 0) {
    months -= 1;
    days = dayIndex(later) - dayIndex(addCalendarMonths(earlier, months));
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  const remMs = ms - (dayIndex(later) - dayIndex(earlier)) * DAY_MS;
  const hours = Math.floor(remMs / 3600000);
  const minutes = Math.floor((remMs % 3600000) / 60000);
  const seconds = Math.floor((remMs % 60000) / 1000);

  return {
    fromIsEarlier,
    diff: {
      years,
      months: remMonths,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalHours,
      totalMinutes,
      totalSeconds,
    },
  };
}

export type DateUnit = 'day' | 'week' | 'month' | 'year';

export function addToDate(d: Date, amount: number, unit: DateUnit): Date {
  if (unit === 'month') return addCalendarMonths(d, amount);
  if (unit === 'year') return addCalendarMonths(d, amount * 12);
  const nd = new Date(d);
  nd.setDate(nd.getDate() + amount * (unit === 'week' ? 7 : 1));
  return nd;
}

export function weekdayName(d: Date): string {
  return `星期${WEEKDAYS[d.getDay()] ?? '?'}`;
}

export function toInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function toDateValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('zh-CN', { hour12: false });
}

export function diffSummary(diff: DateDiff): string {
  const parts: string[] = [];
  if (diff.years) parts.push(`${diff.years} 年`);
  if (diff.months) parts.push(`${diff.months} 个月`);
  if (diff.days) parts.push(`${diff.days} 天`);
  if (diff.hours || diff.minutes || diff.seconds || diff.years === 0) {
    parts.push(
      `${String(diff.hours).padStart(2, '0')}:${String(diff.minutes).padStart(
        2,
        '0',
      )}:${String(diff.seconds).padStart(2, '0')}`,
    );
  }
  return parts.join(' ');
}