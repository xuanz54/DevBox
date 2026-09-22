import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { convertRadix, type Radix } from './core';

const radices: Radix[] = [2, 8, 10, 16];

export default function RadixTool() {
  const [input, setInput] = useState('255');
  const [from, setFrom] = useState<Radix>(10);
  const [to, setTo] = useState<Radix>(16);

  const result = useMemo(() => convertRadix(input, from, to), [input, from, to]);
  const output = result.ok ? result.value : '';
  const error = result.ok ? '' : result.error;

  const swap = () => {
    if (result.ok && output) {
      setInput(output);
      const f = from;
      setFrom(to);
      setTo(f);
    }
  };

  return (
    <ToolPage
      title="进制转换"
      desc="2 / 8 / 10 / 16 进制互转，支持任意大整数（BigInt）"
      actions={<CopyButton text={output} />}
    >
      <ErrorBanner message={error} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs opacity-60">从</label>
        <select
          value={from}
          onChange={(e) => setFrom(Number(e.target.value) as Radix)}
          className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {radices.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="button" className={btn()} onClick={swap}>
          ⇄ 交换
        </button>
        <label className="text-xs opacity-60">到</label>
        <select
          value={to}
          onChange={(e) => setTo(Number(e.target.value) as Radix)}
          className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {radices.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label={`输入（${from} 进制）`} className="min-h-48">
          <TextArea value={input} onChange={setInput} />
        </Pane>
        <Pane label={`输出（${to} 进制）`} className="min-h-48">
          <TextArea value={output} readOnly />
        </Pane>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ['FF', 16, 10],
            ['1010', 2, 10],
            ['777', 8, 10],
          ] as const
        ).map(([v, f, t]) => (
          <button
            key={v}
            type="button"
            className={btn()}
            onClick={() => {
              setInput(v);
              setFrom(f as Radix);
              setTo(t as Radix);
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </ToolPage>
  );
}
