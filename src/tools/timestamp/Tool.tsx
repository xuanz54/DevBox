import { useEffect, useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, ToolPage, btn } from '../../components/ui';
import {
  dateToTimestamp,
  detectPrecision,
  formatTimestamp,
  nowTimestamps,
  parseTimestampInput,
  type TimestampPrecision,
} from './core';

export default function TimestampTool() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [now, setNow] = useState(() => nowTimestamps());
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().slice(0, 16));

  useEffect(() => {
    const id = window.setInterval(() => setNow(nowTimestamps()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsed = useMemo(() => parseTimestampInput(input), [input]);
  const precision: TimestampPrecision = parsed.ok ? detectPrecision(parsed.value) : 's';
  const formatted = useMemo(
    () => (parsed.ok ? formatTimestamp(parsed.value, precision) : null),
    [parsed, precision],
  );

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const iso = dateInput.length === 16 ? `${dateInput}:00` : dateInput;
    return dateToTimestamp(`${iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`}`, 's');
  }, [dateInput]);

  const errorParts: string[] = [];
  if (!parsed.ok) errorParts.push(parsed.error);
  if (formatted && !formatted.ok) errorParts.push(formatted.error);
  if (fromDate && !fromDate.ok) errorParts.push(`日期：${fromDate.error}`);

  return (
    <ToolPage
      title="时间戳"
      desc="Unix 秒/毫秒 ↔ 本地时间，自动识别精度"
      actions={
        <>
          <button
            type="button"
            className={btn()}
            onClick={() => setInput(String(now.s))}
          >
            当前秒
          </button>
          <button type="button" className={btn()} onClick={() => setInput(String(now.ms))}>
            当前毫秒
          </button>
          <CopyButton text={formatted?.ok ? formatted.value.iso : ''} label="复制 ISO" />
        </>
      }
    >
      <ErrorBanner message={errorParts.join('；')} />

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-xs opacity-50">现在（Unix 秒）</div>
          <div className="mt-1 font-mono text-lg">{now.s}</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-xs opacity-50">现在（Unix 毫秒）</div>
          <div className="mt-1 font-mono text-lg">{now.ms}</div>
        </div>
      </div>

      <Pane label="时间戳 → 日期" className="mb-4 min-h-32">
        <div className="flex flex-col gap-3 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10"
              placeholder="1700000000"
            />
            <span className="self-center rounded bg-indigo-500/10 px-2 py-1 text-xs text-indigo-500">
              识别为 {precision === 's' ? '秒' : '毫秒'}
            </span>
          </div>
          {formatted?.ok ? (
            <div className="grid gap-1 font-mono text-xs opacity-80">
              <div>Local: {formatted.value.local}</div>
              <div>UTC: {formatted.value.utc}</div>
              <div>ISO: {formatted.value.iso}</div>
              <div>
                另一精度: {formatted.value.otherPrecision}（
                {precision === 's' ? '毫秒' : '秒'}）
              </div>
            </div>
          ) : null}
        </div>
      </Pane>

      <Pane label="日期 → 时间戳（本地时区，按 UTC 解析输入）" className="min-h-28">
        <div className="flex flex-wrap items-center gap-2 p-3">
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/10"
          />
          {fromDate?.ok ? (
            <span className="font-mono text-sm">
              {fromDate.value} 秒 / {fromDate.value * 1000} 毫秒
            </span>
          ) : null}
        </div>
      </Pane>
    </ToolPage>
  );
}
