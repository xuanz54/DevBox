import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage } from '../../components/ui';
import { jwtExpiry, parseJwt } from './core';

function b64urlDemo(): string {
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({
    sub: '10086',
    name: 'DevBox',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.demo-signature`;
}

export default function JwtTool() {
  const [token, setToken] = useState(b64urlDemo());

  const parsed = useMemo(() => parseJwt(token), [token]);
  const parts = parsed.ok ? parsed.value : null;
  const expiry = useMemo(() => (parts ? jwtExpiry(parts.payload) : null), [parts]);

  const headerText = parts ? JSON.stringify(parts.header, null, 2) : '';
  const payloadText = parts ? JSON.stringify(parts.payload, null, 2) : '';
  const error = parsed.ok ? '' : parsed.error;

  return (
    <ToolPage
      title="JWT 解析"
      desc="解码 Header / Payload（本地，不联网验签）"
      actions={
        <>
          <button
            type="button"
            className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs dark:border-white/10 dark:bg-white/5"
            onClick={() => setToken(b64urlDemo())}
          >
            示例
          </button>
          <CopyButton text={payloadText} label="复制 Payload" />
        </>
      }
    >
      <ErrorBanner message={error} />
      <Pane label="Token" className="mb-4 min-h-24">
        <TextArea value={token} onChange={setToken} placeholder="eyJhbGciOi..." />
      </Pane>

      {parts && expiry ? (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span
            className={`rounded-full px-2.5 py-1 ${
              expiry.expired
                ? 'bg-red-500/15 text-red-500'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
            }`}
          >
            {expiry.exp === undefined
              ? '无 exp 字段'
              : expiry.expired
                ? `已过期 ${Math.abs(expiry.secondsLeft ?? 0)}s`
                : `剩余 ${expiry.secondsLeft}s`}
          </span>
          {expiry.expLocal ? <span className="opacity-60">过期于 {expiry.expLocal}</span> : null}
          <span className="opacity-60">alg: {String(parts.header.alg ?? '—')}</span>
        </div>
      ) : null}

      <div className="grid min-h-0 grid-cols-2 gap-4">
        <Pane label="Header" className="min-h-48">
          <TextArea value={headerText} readOnly />
        </Pane>
        <Pane label="Payload" className="min-h-48">
          <TextArea value={payloadText} readOnly />
        </Pane>
      </div>
      {parts ? (
        <div className="mt-3 break-all rounded-lg bg-black/5 px-3 py-2 font-mono text-[11px] opacity-60 dark:bg-white/5">
          signature: {parts.signature || '(空)'}
        </div>
      ) : null}
    </ToolPage>
  );
}
