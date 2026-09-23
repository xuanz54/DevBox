import { err, ok, type Result } from '../../lib/result';

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

function expandHex(hex: string, short: boolean, offset: number): number {
  if (short) {
    const ch = hex[offset] ?? '0';
    return parseInt(ch + ch, 16);
  }
  return parseInt(`0x${hex.slice(offset, offset + 2) ?? '00'}`, 16);
}

function channel(raw: string): number {
  if (raw.endsWith('%')) return (Number(raw.slice(0, -1)) / 100) * 255;
  return Number(raw);
}

export function parseColor(input: string): Result<Rgb, string> {
  const t = input.trim().toLowerCase();
  if (!t) return err('输入为空');

  const hexMatch = /^#([0-9a-f]{3,8})$/.exec(t);
  if (hexMatch) {
    const hex = hexMatch[1] as string;
    if (hex.length !== 3 && hex.length !== 4 && hex.length !== 6 && hex.length !== 8) {
      return err('Hex 长度非法');
    }
    const short = hex.length < 6;
    const alpha =
      hex.length === 4 || hex.length === 8
        ? channel(hex.length === 4 ? `${hex[3] ?? 'f'}${hex[3] ?? 'f'}` : `0x${hex.slice(6, 8) ?? 'ff'}`)
        : undefined;
    const rgb: Rgb = {
      r: expandHex(hex, short, 0),
      g: expandHex(hex, short, short ? 1 : 2),
      b: expandHex(hex, short, short ? 2 : 4),
    };
    if (alpha !== undefined) rgb.a = alpha / 255;
    return ok(rgb);
  }

  const rgbMatch = /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?)\s*)?\)$/.exec(
    t,
  );
  if (rgbMatch) {
    const rgb: Rgb = {
      r: channel(rgbMatch[1] ?? '0'),
      g: channel(rgbMatch[2] ?? '0'),
      b: channel(rgbMatch[3] ?? '0'),
    };
    const a = rgbMatch[4];
    if (a !== undefined) rgb.a = clamp(Number(a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : a), 0, 1);
    return ok(rgb);
  }

  const hslMatch = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+%?)\s*)?\)$/.exec(
    t,
  );
  if (hslMatch) {
    const rgb = hslToRgb({
      h: Number(hslMatch[1] ?? 0),
      s: Number(hslMatch[2] ?? 0),
      l: Number(hslMatch[3] ?? 0),
    });
    const a = hslMatch[4];
    if (a !== undefined) {
      rgb.a = clamp(Number(a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : a), 0, 1);
    }
    return ok(rgb);
  }

  return err('无法解析的颜色（支持 #hex / rgb() / hsl()）');
}

export function rgbToHex(rgb: Rgb): string {
  const p = (n: number): string =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  const base = `#${p(rgb.r)}${p(rgb.g)}${p(rgb.b)}`;
  if (rgb.a === undefined) return base;
  return `${base}${p(rgb.a * 255)}`;
}

export function rgbToHsl(rgb: Rgb): Hsl {
  const r = clamp(rgb.r, 0, 255) / 255;
  const g = clamp(rgb.g, 0, 255) / 255;
  const b = clamp(rgb.b, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: Hsl): Rgb {
  const h = (((hsl.h % 360) + 360) % 360);
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function formatRgb(rgb: Rgb): string {
  const r = Math.round(rgb.r);
  const g = Math.round(rgb.g);
  const b = Math.round(rgb.b);
  return rgb.a !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${Number(rgb.a.toFixed(3))})`
    : `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl(hsl: Hsl): string {
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

function linearize(c: number): number {
  const v = clamp(c, 0, 255) / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const hi = Math.max(l1, l2) + 0.05;
  const lo = Math.min(l1, l2) + 0.05;
  return hi / lo;
}

export type WcagRating = 'AAA' | 'AA' | 'AA-Large' | 'Fail';

export function wcagRating(ratio: number): WcagRating {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-Large';
  return 'Fail';
}