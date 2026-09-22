import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { decodeBase64Utf8, encodeBase64Utf8 } from './core';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('你好，DevBox');
  const [out, setOut] = useState('');

  const error = useMemo(() => {
    if (mode === 'encode') return '';
    const r = decodeBase64Utf8(input);
    return r.ok ? '' : r.error;
  }, [mode, input]);

  const output = useMemo(() => {
    if (mode === 'encode') return encodeBase64Utf8(input);
    const r = decodeBase64Utf8(input);
    return r.ok ? r.value : '';
  }, [mode, input]);

  const swap = () => {
    if (output) {
      setInput(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <ToolPage
      title="Base64"
      desc="UTF-8 文本编码 / 解码"
      actions={
        <>
          <div className="flex overflow-hidden rounded-md border border-black/10 text-xs dark:border-white/10">
            {(['encode', 'decode'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 ${
                  mode === m ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-white/5'
                }`}
              >
                {m === 'encode' ? '编码' : '解码'}
              </button>
            ))}
          </div>
          <button type="button" className={btn()} onClick={swap} disabled={!output}>
            结果→输入并翻转
          </button>
          <CopyButton text={output} />
        </>
      }
    >
      <ErrorBanner message={error} />
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label={mode === 'encode' ? '原文' : 'Base64'} className="min-h-64">
          <TextArea value={input} onChange={setInput} />
        </Pane>
        <Pane label={mode === 'encode' ? 'Base64' : '解码结果'} className="min-h-64">
          <TextArea value={output} readOnly />
        </Pane>
      </div>
      <div className="mt-3 flex gap-3">
        <button type="button" className={btn()} onClick={() => setInput('')}>
          清空
        </button>
        <button
          type="button"
          className={btn()}
          onClick={() => setInput(btoa(unescape(encodeURIComponent('Hello, DevBox!'))))}
        >
          示例
        </button>
      </div>
      <div className="mt-2 text-xs opacity-50">输出 {output.length} 字符</div>
    </ToolPage>
  );
}
