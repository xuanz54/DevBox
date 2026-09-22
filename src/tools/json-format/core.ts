import { err, ok, type Result } from '../../lib/result';

export interface JsonFormatOptions {
  indent: number;
}

export function parseJson(input: string): Result<unknown, string> {
  const trimmed = input.trim();
  if (!trimmed) {
    return err('输入为空');
  }
  try {
    return ok(JSON.parse(trimmed) as unknown);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`JSON 解析失败：${msg}`);
  }
}

export function formatJson(input: string, options: JsonFormatOptions): Result<string, string> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  const indent = Math.min(Math.max(Math.trunc(options.indent), 0), 8);
  return ok(JSON.stringify(parsed.value, null, indent));
}

export function compressJson(input: string): Result<string, string> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  return ok(JSON.stringify(parsed.value));
}

export function jsonTypeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
