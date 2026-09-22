import { err, ok, type Result } from '../../lib/result';

const SUPPORTED = [2, 8, 10, 16] as const;
export type Radix = (typeof SUPPORTED)[number];

export function isSupportedRadix(n: number): n is Radix {
  return (SUPPORTED as readonly number[]).includes(n);
}

export function convertRadix(input: string, from: number, to: number): Result<string, string> {
  if (!isSupportedRadix(from) || !isSupportedRadix(to)) {
    return err('仅支持 2 / 8 / 10 / 16 进制');
  }
  const cleaned = input.trim().replace(/_/g, '');
  if (!cleaned) return err('输入为空');

  const negative = cleaned.startsWith('-');
  let body = negative ? cleaned.slice(1) : cleaned;
  if (from === 16) body = body.replace(/^0x/i, '');
  else if (from === 2) body = body.replace(/^0b/i, '');
  else if (from === 8) body = body.replace(/^0o/i, '');
  if (!body) return err('输入为空');

  const pattern =
    from === 16
      ? /^[0-9a-fA-F]+$/
      : from === 10
        ? /^[0-9]+$/
        : from === 8
          ? /^[0-7]+$/
          : /^[01]+$/;
  if (!pattern.test(body)) {
    return err(`不是合法的 ${from} 进制数字`);
  }

  let value: bigint;
  try {
    const prefix = from === 16 ? '0x' : from === 2 ? '0b' : from === 8 ? '0o' : '';
    value = from === 10 ? BigInt(body) : BigInt(`${prefix}${body}`);
  } catch {
    return err('数字格式错误');
  }

  const signed = negative ? -value : value;
  return ok(signed.toString(to));
}
