import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { decodeUrl, encodeUrl, tryParseQueryString } from './core';

export default function UrlTool() {
  const [mode, setMode] = useState<'encode' | 'decode' | 'query'>('encode');
  const [input, setInput] = useState('https://example.com/s?q=中文 key&lang=zh-CN');

  const result = useMemo<{ ok: boolean; value?: string; error?: string }>(() => {
    if (mode === 'encode') return { ok: true, value: encodeUrl(input) };
    if (mode === 'decode') {
      const r = decodeUrl(input);
      return r.ok ? { ok: true, value: r.value } : { ok: false, error: r.error };
    }
    const r = tryParseQueryString(input);
    return r.ok
      ? { ok: true, value: JSON.stringify(r.value, null, 2) }
      : { ok: false, error: r.error };
  }, [mode, input]);

  const output = result.ok ? (result.value ?? '') : '';
  const error = result.ok ? '' : (result.error ?? '');

  return (
    <ToolPage
      title="URL 编解码"
      desc="encodeURIComponent / 查询串解析"
      actions={
        <>
          <div className="flex overflow-hidden rounded-md border border-black/10 text-xs dark:border-white/10">
            {(
              [
                ['encode', '编码'],
                ['decode', '解码'],
                ['query', '查询串'],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 ${mode === m ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-white/5'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <CopyButton text={output} />
        </>
      }
    >
      <ErrorBanner message={error} />
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label="输入" className="min-h-64">
          <TextArea value={input} onChange={setInput} />
        </Pane>
        <Pane label="输出" className="min-h-64">
          <TextArea value={output} readOnly />
        </Pane>
      </div>
      <button type="button" className={`${btn()} mt-3`} onClick={() => setInput('')}>
        清空
      </button>
    </ToolPage>
  );
}
