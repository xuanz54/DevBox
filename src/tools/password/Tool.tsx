import { useCallback, useMemo, useState } from 'react';
import { CopyButton, ToolPage, btn } from '../../components/ui';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  symbol: '!@#$%^&*()-_=+[]{};:,.<>?',
} as const;

const SET_LABELS: Record<SetKey, string> = {
  lower: '小写字母',
  upper: '大写字母',
  digit: '数字',
  symbol: '符号',
};

type SetKey = keyof typeof SETS;

function randomInt(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] ?? 0;
  } while (x >= limit);
  return x % max;
}

function generatePassword(length: number, sets: SetKey[], excludeAmbiguous: boolean): string {
  const ambiguous = 'Il1O0o';
  let pool = sets.map((k) => SETS[k] as string).join('');
  if (excludeAmbiguous) {
    pool = [...pool].filter((c) => !ambiguous.includes(c)).join('');
  }
  if (!pool) return '';
  const chars: string[] = [];
  for (const s of sets) {
    let alphabet: string = SETS[s];
    if (excludeAmbiguous) {
      alphabet = [...alphabet].filter((c) => !ambiguous.includes(c)).join('');
    }
    if (alphabet) {
      chars.push(alphabet[randomInt(alphabet.length)] ?? '');
    }
  }
  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)] ?? '');
  }
  // Fisher–Yates
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const a = chars[i];
    const b = chars[j];
    if (a !== undefined && b !== undefined) {
      chars[i] = b;
      chars[j] = a;
    }
  }
  return chars.slice(0, length).join('');
}

function entropyBits(length: number, poolSize: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(poolSize) * 10) / 10;
}

export default function PasswordTool() {
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState<SetKey[]>(['lower', 'upper', 'digit', 'symbol']);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(5);
  const [items, setItems] = useState<string[]>([]);

  const poolSize = useMemo(() => {
    let pool = sets.map((k) => SETS[k]).join('');
    if (excludeAmbiguous) {
      pool = [...pool].filter((c) => !'Il1O0o'.includes(c)).join('');
    }
    return pool.length;
  }, [sets, excludeAmbiguous]);

  const bits = entropyBits(length, poolSize);

  const generate = useCallback(() => {
    const n = Math.min(Math.max(count, 1), 50);
    const len = Math.min(Math.max(length, 4), 128);
    const next: string[] = [];
    for (let i = 0; i < n; i++) {
      next.push(generatePassword(len, sets, excludeAmbiguous));
    }
    setItems(next);
  }, [count, length, sets, excludeAmbiguous]);

  const toggleSet = (k: SetKey) => {
    setSets((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  return (
    <ToolPage
      title="密码生成"
      desc="本地安全随机，可配置字符集与长度；不用联网，不上传任何数据"
      actions={
        <>
          <CopyButton text={items[0] ?? ''} label="复制第一个" />
          <button type="button" className={btn(true)} onClick={generate}>
            生成
          </button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          长度
          <input
            type="number"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="flex items-center gap-2">
          数量
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
          />
          排除易混淆（I l 1 O 0 o）
        </label>
        <span className="text-xs opacity-60">
          字符池 {poolSize} 个 · 约 {bits} 比特（bits）随机度
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(SETS) as SetKey[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`${btn(sets.includes(k))} ${sets.includes(k) ? '' : 'opacity-60'}`}
            onClick={() => toggleSet(k)}
          >
            {SET_LABELS[k]}
          </button>
        ))}
        <button type="button" className={btn()} onClick={generate}>
          刷新
        </button>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-1.5 font-mono text-sm">
          {items.length === 0 ? (
            <span className="opacity-40">点击「生成」…</span>
          ) : (
            items.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="select-all break-all">{p}</span>
                <CopyButton text={p} label="复制" />
              </div>
            ))
          )}
        </div>
      </div>
    </ToolPage>
  );
}
