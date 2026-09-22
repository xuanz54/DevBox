import { describe, expect, it } from 'vitest';
import { jwtExpiry, parseJwt } from './core';

function b64url(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

describe('parseJwt', () => {
  it('parses a fake jwt', () => {
    const token = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({
      sub: '1',
      exp: 1_900_000_000,
    })}.sig`;
    const r = parseJwt(token);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.header.alg).toBe('HS256');
      expect(r.value.payload.sub).toBe('1');
      expect(r.value.signature).toBe('sig');
    }
  });

  it('rejects wrong segment count', () => {
    expect(parseJwt('a.b').ok).toBe(false);
    expect(parseJwt('').ok).toBe(false);
  });
});

describe('jwtExpiry', () => {
  it('detects expired', () => {
    const e = jwtExpiry({ exp: 1000 }, 2_000_000);
    expect(e.expired).toBe(true);
  });

  it('detects valid', () => {
    const e = jwtExpiry({ exp: 4_000_000_000 }, 2_000_000);
    expect(e.expired).toBe(false);
    expect(e.secondsLeft).toBeGreaterThan(0);
  });
});
