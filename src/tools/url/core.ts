import { err, ok, type Result } from '../../lib/result';

export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrl(input: string): Result<string, string> {
  if (!input) return err('输入为空');
  try {
    return ok(decodeURIComponent(input));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`解码失败：${msg}`);
  }
}

export function tryParseQueryString(input: string): Result<Record<string, string>, string> {
  const raw = input.trim();
  if (!raw) return err('输入为空');
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw;
  const qIndex = withoutHash.indexOf('?');
  const qs = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : withoutHash;
  if (!qs) return err('未找到查询串');
  const out: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const k = eq >= 0 ? pair.slice(0, eq) : pair;
    const v = eq >= 0 ? pair.slice(eq + 1) : '';
    try {
      out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch {
      out[k] = v;
    }
  }
  return ok(out);
}
