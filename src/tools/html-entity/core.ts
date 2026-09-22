import { err, ok, type Result } from '../../lib/result';

const CHAR_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const NAMED_DECODE: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  hellip: '…',
  mdash: '—',
  ndash: '–',
};

export function encodeHtmlEntities(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => CHAR_ENTITIES[ch] ?? ch);
}

export function decodeHtmlEntities(input: string): Result<string, string> {
  if (!input) return err('输入为空');
  const text = input.replace(
    /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g,
    (full, body: string) => {
      if (body.startsWith('#x') || body.startsWith('#X')) {
        const code = Number.parseInt(body.slice(2), 16);
        if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
          try {
            return String.fromCodePoint(code);
          } catch {
            return full;
          }
        }
        return full;
      }
      if (body.startsWith('#')) {
        const code = Number.parseInt(body.slice(1), 10);
        if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
          try {
            return String.fromCodePoint(code);
          } catch {
            return full;
          }
        }
        return full;
      }
      const named = NAMED_DECODE[body] ?? NAMED_DECODE[body.toLowerCase()];
      return named ?? full;
    },
  );
  return ok(text);
}
