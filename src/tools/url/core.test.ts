import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl, tryParseQueryString } from './core';

describe('url', () => {
  it('encodes and decodes', () => {
    const s = 'a b&c=中文';
    const enc = encodeUrl(s);
    expect(enc).toContain('%20');
    const r = decodeUrl(enc);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(s);
  });

  it('rejects bad decode', () => {
    expect(decodeUrl('%E0%A4%A').ok).toBe(false);
  });

  it('parses query string', () => {
    const r = tryParseQueryString('https://x.dev/p?a=1&b=%E4%B8%AD');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.a).toBe('1');
      expect(r.value.b).toBe('中');
    }
  });
});
