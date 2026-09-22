import { describe, expect, it } from 'vitest';
import { decodeBase64Utf8, encodeBase64Utf8 } from './core';

describe('base64', () => {
  it('roundtrips ascii', () => {
    expect(encodeBase64Utf8('hello')).toBe('aGVsbG8=');
    const r = decodeBase64Utf8('aGVsbG8=');
    expect(r).toEqual({ ok: true, value: 'hello' });
  });

  it('roundtrips utf8 chinese', () => {
    const text = '你好，DevBox';
    const encoded = encodeBase64Utf8(text);
    const r = decodeBase64Utf8(encoded);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(text);
  });

  it('rejects invalid', () => {
    expect(decodeBase64Utf8('!!!').ok).toBe(false);
    expect(decodeBase64Utf8('').ok).toBe(false);
  });
});
