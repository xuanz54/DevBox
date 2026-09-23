import { describe, expect, it } from 'vitest';
import { decodePngDataUrl, generateQrDataUrl, isPngDataUrl } from './core';

describe('qr', () => {
  it('generates a valid png data url', async () => {
    const r = await generateQrDataUrl('https://devbox.example');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(isPngDataUrl(r.value)).toBe(true);
      expect(decodePngDataUrl(r.value)).toBeInstanceOf(ArrayBuffer);
    }
  });

  it('honors options', async () => {
    const r = await generateQrDataUrl('hello', { size: 160, errorCorrectionLevel: 'H' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const buf = decodePngDataUrl(r.value);
      expect(buf).not.toBeNull();
      expect(buf?.byteLength).toBeGreaterThan(100);
    }
  });

  it('rejects empty input', async () => {
    const r = await generateQrDataUrl('   ');
    expect(r).toEqual({ ok: false, error: '输入为空' });
  });

  it('detects png data urls', () => {
    expect(isPngDataUrl('data:image/png;base64,AAAA')).toBe(true);
    expect(isPngDataUrl('not a url')).toBe(false);
  });
});