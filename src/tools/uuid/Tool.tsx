import { useCallback, useState } from 'react';
import { CopyButton, ToolPage, btn } from '../../components/ui';

function uuidV4(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}

export default function UuidTool() {
  const [count, setCount] = useState(8);
  const [upper, setUpper] = useState(false);
  const [list, setList] = useState<string[]>(() =>
    Array.from({ length: 8 }, () => uuidV4()),
  );

  const generate = useCallback(() => {
    const n = Math.min(Math.max(count, 1), 200);
    const next = Array.from({ length: n }, () => uuidV4());
    setList(next);
  }, [count]);

  const display = list.map((u) => (upper ? u.toUpperCase() : u));

  return (
    <ToolPage
      title="UUID 生成"
      desc="批量 UUID v4（crypto.getRandomValues）"
      actions={
        <>
          <CopyButton text={display.join('\n')} label="复制全部" />
          <button type="button" className={btn(true)} onClick={generate}>
            重新生成
          </button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          数量
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.target.checked)}
          />
          大写
        </label>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-1 font-mono text-sm">
          {display.map((u, i) => (
            <div key={`${u}-${i}`} className="flex items-center justify-between gap-3">
              <span className="select-all break-all">{u}</span>
              <CopyButton text={u} label="复制" />
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
