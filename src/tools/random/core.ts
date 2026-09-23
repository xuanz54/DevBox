import { err, ok, type Result } from '../../lib/result';

export function splitOptions(input: string): string[] {
  return input
    .split(/[\n,，;；、]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function cryptoRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] ?? 0;
  } while (x >= limit);
  return x % max;
}

export function pickRandom(options: readonly string[]): Result<string, string> {
  if (options.length === 0) return err('至少填入一个选项');
  return ok(options[cryptoRandomInt(options.length)] ?? (options[0] ?? ''));
}

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    const a = arr[i];
    const b = arr[j];
    if (a !== undefined && b !== undefined) {
      arr[i] = b;
      arr[j] = a;
    }
  }
  return arr;
}