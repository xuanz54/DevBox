import { err, ok, type Result } from '../../lib/result';

export type TimestampPrecision = 's' | 'ms';

export function detectPrecision(value: number): TimestampPrecision {
  return Math.abs(value) < 1e12 ? 's' : 'ms';
}

export function formatTimestamp(
  value: number,
  precision: TimestampPrecision,
): Result<{ iso: string; local: string; utc: string; otherPrecision: number }, string> {
  if (!Number.isFinite(value)) return err('不是有效数字');
  const ms = precision === 's' ? value * 1000 : value;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return err('超出可解析范围');
  return ok({
    iso: d.toISOString(),
    local: d.toLocaleString(),
    utc: d.toUTCString(),
    otherPrecision: precision === 's' ? Math.trunc(ms) : Math.trunc(ms / 1000),
  });
}

export function parseTimestampInput(input: string): Result<number, string> {
  const trimmed = input.trim();
  if (!trimmed) return err('输入为空');
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return err('仅支持十进制数字时间戳（秒或毫秒）');
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return err('数字无效');
  return ok(n);
}

export function nowTimestamps(): { s: number; ms: number } {
  const ms = Date.now();
  return { ms, s: Math.floor(ms / 1000) };
}

export function dateToTimestamp(dateIso: string, precision: TimestampPrecision): Result<number, string> {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return err('日期格式无效');
  const ms = d.getTime();
  return ok(precision === 's' ? Math.floor(ms / 1000) : ms);
}
