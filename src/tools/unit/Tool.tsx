import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, ToolPage, btn } from '../../components/ui';
import { convertUnit, formatUnitResult, unitCategories } from './core';

const categoryDefaults: Record<string, [string, string]> = {
  length: ['m', 'km'],
  weight: ['kg', 'lb'],
  temperature: ['c', 'f'],
  area: ['m2', 'mu'],
  volume: ['l', 'gal'],
  speed: ['kmh', 'mph'],
  time: ['h', 'min'],
  data: ['mb', 'gib'],
};

export default function UnitTool() {
  const [catKey, setCatKey] = useState('length');
  const [fromKey, setFromKey] = useState('m');
  const [toKey, setToKey] = useState('km');
  const [valueStr, setValueStr] = useState('1');

  const cat = unitCategories.find((x) => x.key === catKey);
  const from = cat?.units.find((u) => u.key === fromKey);
  const to = cat?.units.find((u) => u.key === toKey);

  const numeric = valueStr.trim() === '' ? null : Number(valueStr);

  const convertFor = (v: number) => convertUnit(catKey, v, fromKey, toKey);

  const converted = useMemo(
    () => (numeric === null ? null : convertFor(numeric)),
    [numeric, catKey, fromKey, toKey],
  );
  const one = useMemo(() => convertFor(1), [catKey, fromKey, toKey]);

  const error =
    numeric === null
      ? ''
      : !Number.isFinite(numeric)
        ? '请输入有效的数值'
        : converted && !converted.ok
          ? converted.error
          : '';

  const result =
    converted?.ok ? `${formatUnitResult(converted.value)} ${to?.symbol ?? ''}` : '—';
  const formula =
    one && one.ok && from && to
      ? `1 ${from.symbol} = ${formatUnitResult(one.value)} ${to.symbol}`
      : '';

  const changeCategory = (k: string) => {
    setCatKey(k);
    const def = categoryDefaults[k] ?? ['m', 'km'];
    const [dFrom, dTo] = def;
    if (dFrom) setFromKey(dFrom);
    if (dTo) setToKey(dTo);
  };

  const pairLabels = () => {
    const def = categoryDefaults[catKey] ?? ['m', 'km'];
    const fromLabel = cat?.units.find((u) => u.key === def[0])?.label ?? '';
    const toLabel = cat?.units.find((u) => u.key === def[1])?.label ?? '';
    return `${fromLabel} → ${toLabel}`;
  };

  return (
    <ToolPage
      title="单位换算"
      desc="长度 / 重量 / 温度 / 面积 / 体积 / 速度 / 时间 / 数据单位互转"
      actions={
        <>
          <button
            type="button"
            className={btn()}
            onClick={() => {
              setFromKey(toKey);
              setToKey(fromKey);
            }}
          >
            交换 ⇄
          </button>
          <CopyButton text={converted?.ok ? String(converted.value) : ''} label="复制数值" />
        </>
      }
    >
      <ErrorBanner message={error} />

      <div className="mb-5 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">类别</span>
          <select
            value={catKey}
            onChange={(e) => changeCategory(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {unitCategories.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">数值</span>
          <input
            value={valueStr}
            onChange={(e) => setValueStr(e.target.value)}
            inputMode="decimal"
            className="w-32 rounded-md border border-black/10 bg-transparent px-3 py-2 font-mono outline-none focus:border-indigo-400 dark:border-white/10"
            placeholder="1"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">从</span>
          <select
            value={fromKey}
            onChange={(e) => setFromKey(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {cat?.units.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">到</span>
          <select
            value={toKey}
            onChange={(e) => setToKey(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {cat?.units.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5">
        <div className="text-xs opacity-50">结果</div>
        <div className="mt-2 break-all font-mono text-3xl font-semibold">
          {valueStr.trim() ? `${valueStr} ${from?.symbol ?? ''} = ` : ''}
          {result}
        </div>
        {formula ? <div className="mt-2 text-xs opacity-50">{formula}</div> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btn()} onClick={() => changeCategory(catKey)}>
          常用配对比：{pairLabels()}
        </button>
        <button type="button" className={btn()} onClick={() => changeCategory('length')}>
          长度
        </button>
        <button type="button" className={btn()} onClick={() => changeCategory('temperature')}>
          温度
        </button>
        <button type="button" className={btn()} onClick={() => changeCategory('data')}>
          数据
        </button>
      </div>
    </ToolPage>
  );
}