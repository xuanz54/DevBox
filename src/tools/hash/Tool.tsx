import { useCallback, useEffect, useState } from 'react';
import { CopyButton, Pane, ToolPage, btn } from '../../components/ui';

async function digest(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', data: BufferSource): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
      desc="SHA-1 / SHA-256 / SHA-512（Web Crypto，文本或文件）"
      actions={<CopyButton text={results['SHA-256'] ?? ''} label="复制 SHA-256" />}
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
        {(['SHA-1', 'SHA-256', 'SHA-512'] as const).map((algo) => (
          <div
            key={algo}
            className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium opacity-60">{algo}</span>
              <CopyButton text={results[algo] ?? ''} />
            </div>
            <code className="block break-all font-mono text-xs opacity-90">
              {results[algo] ?? '…'}
            </code>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}
