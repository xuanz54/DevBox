import QRCode from 'qrcode';
import { err, ok, type Result } from '../../lib/result';

export type EcLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: EcLevel;
  dark?: string;
  light?: string;
}

const PNG_MIME = /^data:image\/png;base64,/;

export function isPngDataUrl(url: string): boolean {
  return PNG_MIME.test(url);
}

export function decodePngDataUrl(url: string): ArrayBuffer | null {
  const m = /^data:image\/png;base64,(.+)$/.exec(url);
  if (!m?.[1]) return null;
  try {
    const bin = atob(m[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
}

export async function generateQrDataUrl(
  text: string,
  opts: QrOptions = {},
): Promise<Result<string, string>> {
  if (!text.trim()) return err('输入为空');
  try {
    const url = await QRCode.toDataURL(text, {
      width: opts.size && opts.size > 0 ? opts.size : 280,
      margin: opts.margin ?? 1,
      errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
      color: { dark: opts.dark ?? '#000000', light: opts.light ?? '#ffffff' },
    });
    return ok(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`生成失败：${msg}`);
  }
}