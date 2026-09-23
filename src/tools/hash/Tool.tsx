import { useCallback, useEffect, useState } from 'react';
import { CopyButton, Pane, ToolPage, btn } from '../../components/ui';

async function digest(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', data: BufferSource): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ALGOS: { key: 'SHA-1' | 'SHA-256' | 'SHA-512'; label: string; hint: string }[] = [
  {
    key: 'SHA-1',
    label: 'SHA-1（安全散列算法第 1 版）',
    hint: '已不安全，仅用于校验旧文件；输出 160 位（40 个十六进制字符）',
  },
  {
    key: 'SHA-256',
    label: 'SHA-256（安全散列算法第 2 版，256 位）',
    hint: '当前最常用，GitHub、TLS 证书等均采用；输出 64 个十六进制字符',
  },
  {
    key: 'SHA-512',
    label: 'SHA-512（安全散列算法第 2 版，512 位）',
    hint: '输出更长更抗碰撞性，大文件校验常用；输出 128 个十六进制字符',
  },
];

export default function HashTool() {
  const [text, setText] = useState('DevBox');
  const [results, setResults] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const runText = useCallback(async (value: string) => {
    setError('');
    try {
      const data = new TextEncoder().encode(value);
      const [a, b, c] = await Promise.all([
        digest('SHA-1', data),
        digest('SHA-256', data),
        digest('SHA-512', data),
      ]);
      setResults({ 'SHA-1': a, 'SHA-256': b, 'SHA-512': c });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void runText(text);
  }, [text, runText]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    try {
      const buf = await file.arrayBuffer();
      const [a, b, c] = await Promise.all([
        digest('SHA-1', buf),
        digest('SHA-256', buf),
        digest('SHA-512', buf),
      ]);
      setResults({ 'SHA-1': a, 'SHA-256': b, 'SHA-512': c });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ToolPage
      title="哈希计算"
      desc="哈希（Hash，也叫摘要 / 指纹）：把任意内容压缩成固定长度的字符串，内容变一点结果就完全不同。算法 SHA-1 / SHA-256 / SHA-512，用浏览器自带的加密库（Web Crypto），支持文本或文件"
      actions={<CopyButton text={results['SHA-256'] ?? ''} label="复制 SHA-256 摘要" />}
    >
      {error ? (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          {error}
        </div>
      ) : null}
      <Pane label="文本" className="mb-4 min-h-28">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="h-full min-h-24 w-full flex-1 resize-none bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
      </Pane>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className={`${btn()} cursor-pointer`}>
          选择文件…
          <input
            type="file"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        {fileName ? <span className="text-xs opacity-60">{fileName}</span> : null}
        <button
          type="button"
          className={btn()}
          onClick={() => {
            setFileName('');
            setText('');
            setResults({});
          }}
        >
          重置
        </button>
      </div>
      <div className="grid gap-2">
        {ALGOS.map((algo) => (
          <div
            key={algo.key}
            className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-xs font-medium">{algo.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-50">{algo.hint}</span>
              </span>
              <CopyButton text={results[algo.key] ?? ''} />
            </div>
            <code className="block break-all font-mono text-xs opacity-90">
              {results[algo.key] ?? '…'}
            </code>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}
