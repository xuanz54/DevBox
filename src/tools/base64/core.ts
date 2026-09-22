import { err, ok, type Result } from '../../lib/result';

export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const byte of bytes) {
    bin += String.fromCharCode(byte);
  }
  return btoa(bin);
}

export function decodeBase64Utf8(input: string): Result<string, string> {
  const cleaned = input.replace(/\s+/g, '');
  if (!cleaned) return err('输入为空');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    return err('非法 Base64 字符');
  }
  if (cleaned.length % 4 !== 0) {
    return err('Base64 长度非法（须为 4 的倍数，或含合法 padding）');
  }
  try {
    const bin = atob(cleaned);
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return ok(new TextDecoder('utf-8', { fatal: false }).decode(bytes));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`解码失败：${msg}`);
  }
}
