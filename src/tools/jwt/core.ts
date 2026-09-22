import { err, ok, type Result } from '../../lib/result';

export interface JwtParts {
  readonly header: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
  readonly signature: string;
  readonly raw: {
    readonly header: string;
    readonly payload: string;
    readonly signature: string;
  };
}

function b64urlDecode(part: string): Result<string, string> {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  try {
    const bin = atob(padded + pad);
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return ok(new TextDecoder().decode(bytes));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`base64url 解码失败：${msg}`);
  }
}

export function parseJwt(token: string): Result<JwtParts, string> {
  const trimmed = token.trim();
  if (!trimmed) return err('输入为空');
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return err(`JWT 应由 3 段组成，当前 ${parts.length} 段`);
  }
  const [h, p, s] = parts as [string, string, string];
  if (!h || !p) return err('JWT header/payload 为空');

  const headerJson = b64urlDecode(h);
  if (!headerJson.ok) return headerJson;
  const payloadJson = b64urlDecode(p);
  if (!payloadJson.ok) return payloadJson;

  let header: unknown;
  let payload: unknown;
  try {
    header = JSON.parse(headerJson.value);
  } catch (e) {
    return err(`header 不是合法 JSON：${e instanceof Error ? e.message : String(e)}`);
  }
  try {
    payload = JSON.parse(payloadJson.value);
  } catch (e) {
    return err(`payload 不是合法 JSON：${e instanceof Error ? e.message : String(e)}`);
  }
  if (typeof header !== 'object' || header === null || Array.isArray(header)) {
    return err('header 必须是 JSON 对象');
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return err('payload 必须是 JSON 对象');
  }

  return ok({
    header: header as Record<string, unknown>,
    payload: payload as Record<string, unknown>,
    signature: s,
    raw: { header: h, payload: p, signature: s },
  });
}

export interface JwtExpiry {
  readonly exp?: number;
  readonly iat?: number;
  readonly nbf?: number;
  readonly expired: boolean;
  readonly secondsLeft?: number;
  readonly expLocal?: string;
}

export function jwtExpiry(payload: Record<string, unknown>, nowMs = Date.now()): JwtExpiry {
  const num = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  const exp = num(payload.exp);
  const iat = num(payload.iat);
  const nbf = num(payload.nbf);
  const out: { -readonly [K in keyof JwtExpiry]: JwtExpiry[K] } = { expired: false };
  if (iat !== undefined) out.iat = iat;
  if (nbf !== undefined) out.nbf = nbf;
  if (exp !== undefined) {
    out.exp = exp;
    const expMs = exp * 1000;
    const secondsLeft = Math.floor((expMs - nowMs) / 1000);
    out.secondsLeft = secondsLeft;
    out.expired = secondsLeft <= 0;
    out.expLocal = new Date(expMs).toLocaleString();
  }
  return out;
}
