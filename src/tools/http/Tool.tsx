import { useCallback, useState } from 'react';
import { net } from '@neutralinojs/lib';
import { CopyButton, Pane, ToolPage, btn } from '../../components/ui';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const;
type Method = (typeof METHODS)[number];

interface HttpResponseState {
  status: number;
  statusText: string;
  ms: number;
  headers: string;
  body: string;
}

function isNative(): boolean {
  return typeof window.NL_APPID === 'string';
}

async function doFetch(
  url: string,
  method: Method,
  headersText: string,
  body: string,
): Promise<
  | { ok: true; value: HttpResponseState }
  | { ok: false; error: string }
> {
  const headers: Record<string, string> = {};
  if (headersText.trim()) {
    try {
      const obj: unknown = JSON.parse(headersText);
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return { ok: false, error: '请求头必须是 JSON 对象' };
      }
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        headers[k] = String(v);
      }
    } catch (e) {
      return { ok: false, error: `请求头 JSON 错误：${e instanceof Error ? e.message : String(e)}` };
    }
  }

  const init: RequestInit = { method, headers };
  if (method !== 'GET' && method !== 'HEAD' && body) {
    init.body = body;
  }

    const started = performance.now();
  try {
    let status: number;
    let statusText: string;
    let headerLines: string[];
    let text: string;

    if (isNative()) {
      const opts = {
        headers,
        body: init.body as string | undefined,
        encodePath: true,
        keepAlive: false,
      } as unknown as Parameters<typeof net.request>[2];
      const res = await net.request(url, method, opts);
      status = res.status;
      statusText = res.statusText;
      text = res.body;
      const h = res.headers as unknown;
      if (Array.isArray(h)) {
        headerLines = h.flatMap((item: Record<string, string>) =>
          Object.entries(item).map(([k, v]) => `${k}: ${v}`),
        );
      } else if (h && typeof h === 'object') {
        headerLines = Object.entries(h as Record<string, string>).map(
          ([k, v]) => `${k}: ${v}`,
        );
      } else {
        headerLines = [];
      }
    } else {
      const res = await fetch(url, init);
      status = res.status;
      statusText = res.statusText;
      text = await res.text();
      headerLines = [];
      res.headers.forEach((value: string, key: string) => {
        headerLines.push(`${key}: ${value}`);
      });
    }

    const ms = Math.round(performance.now() - started);
    let formatted = text;
    try {
      const parsed: unknown = JSON.parse(text);
      formatted = JSON.stringify(parsed, null, 2);
    } catch {
      /* keep raw */
    }
    return {
      ok: true,
      value: {
        status,
        statusText,
        ms,
        headers: headerLines.join('\n'),
        body: formatted,
      },
    };
  } catch (e) {
    const ms = Math.round(performance.now() - started);
    return {
      ok: false,
      error: `请求失败（${ms}ms）：${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export default function HttpTool() {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://httpbin.org/get');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [res, setRes] = useState<HttpResponseState | null>(null);

  const send = useCallback(async () => {
    setLoading(true);
    setError('');
    setRes(null);
    const r = await doFetch(url.trim(), method, headers, body);
    setLoading(false);
    if (r.ok) setRes(r.value);
    else setError(r.error);
  }, [url, method, headers, body]);

  return (
    <ToolPage
      title="HTTP 请求"
      desc={
        isNative()
          ? '经 Neutralino 原生网络发送（无 CORS 限制）'
          : '浏览器模式：受 CORS 限制，桌面版无此限制'
      }
      actions={
        <button type="button" className={btn(true)} onClick={() => void send()} disabled={loading}>
          {loading ? '请求中…' : '发送'}
        </button>
      }
    >
      {error ? (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          {error}
        </div>
      ) : null}
      <div className="mb-3 flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="rounded-md border border-black/10 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/…"
          className="flex-1 rounded-md border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="grid min-h-0 grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Pane label="Headers (JSON)" className="min-h-36">
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              spellCheck={false}
              className="h-full min-h-32 w-full flex-1 resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none"
            />
          </Pane>
          <Pane label="Body" className="min-h-32">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              placeholder="POST/PUT/PATCH 请求体…"
              className="h-full min-h-28 w-full flex-1 resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none"
            />
          </Pane>
        </div>
        <div className="flex flex-col gap-4">
          <Pane label="响应" className="min-h-36">
            {res ? (
              <div className="p-3 text-xs">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 font-mono ${
                      res.status >= 200 && res.status < 300
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'bg-red-500/15 text-red-500'
                    }`}
                  >
                    {res.status} {res.statusText}
                  </span>
                  <span className="opacity-60">{res.ms} ms</span>
                  <CopyButton text={res.body} label="复制 Body" />
                </div>
                <div className="mb-2 whitespace-pre-wrap font-mono opacity-60">{res.headers}</div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono">
                  {res.body}
                </pre>
              </div>
            ) : (
              <div className="p-4 text-xs opacity-40">尚未请求</div>
            )}
          </Pane>
        </div>
      </div>
      <div className="mt-3">
        <button
          type="button"
          className={btn()}
          onClick={() => {
            setUrl('https://httpbin.org/get');
            setMethod('GET');
            setHeaders('{\n  "Accept": "application/json"\n}');
            setBody('');
            setRes(null);
            setError('');
          }}
        >
          重置示例
        </button>
      </div>
    </ToolPage>
  );
}
