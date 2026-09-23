import { useEffect, useMemo, useState } from 'react';
import { ErrorBanner, Pane, ToolPage, btn } from '../../components/ui';
import {
  addToDate,
  diffDates,
  diffSummary,
  formatDateTime,
  parseDateInput,
  toDateValue,
  toInputValue,
  weekdayName,
} from './core';

function today(): string {
  return toDateValue(new Date());
}

function nowInput(): string {
  return toInputValue(new Date());
}

function daysFromNow(days: number): string {
  return toDateValue(addToDate(new Date(), days, 'day'));
}

export default function DateTool() {
  const [dateA, setDateA] = useState('2026-01-01T08:00');
  const [dateB, setDateB] = useState(() => nowInput());
  const [baseDate, setBaseDate] = useState(() => today());
  const [countdownTarget, setCountdownTarget] = useState(() => daysFromNow(90));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsedA = useMemo(() => parseDateInput(dateA), [dateA]);
  const parsedB = useMemo(() => parseDateInput(dateB), [dateB]);
  const parsedBase = useMemo(() => parseDateInput(baseDate), [baseDate]);
  const parsedTarget = useMemo(() => parseDateInput(countdownTarget), [countdownTarget]);

  const diffError = [parsedA, parsedB]
    .filter((r): r is { ok: false; error: string } => !r.ok)
    .map((r) => r.error)
    .join('；');

  const diff = parsedA.ok && parsedB.ok ? diffDates(parsedA.value, parsedB.value) : null;

  const countdown =
    parsedTarget.ok && countdownTarget ? diffDates(now, parsedTarget.value) : null;

  const addDays = (amount: number, unit: 'day' | 'week' | 'month' | 'year') => {
    if (parsedBase.ok) setBaseDate(toDateValue(addToDate(parsedBase.value, amount, unit)));
  };

  return (
    <ToolPage
      title="日期计算"
      desc="日期差、倒数日、加减天数与星期"
      actions={
        <button
          type="button"
          className={btn()}
          onClick={() => {
            setDateA(dateB);
            setDateB(dateA);
          }}
        >
          交换 A / B
        </button>
      }
    >
      <ErrorBanner message={diffError} />

      <Pane label="日期差计算" className="mb-4 min-h-36">
        <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <input
            type="datetime-local"
            value={dateA}
            onChange={(e) => setDateA(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 outline-none dark:border-white/10"
          />
          <span className="opacity-50">→</span>
          <input
            type="datetime-local"
            value={dateB}
            onChange={(e) => setDateB(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 outline-none dark:border-white/10"
          />
          <button
            type="button"
            className={btn()}
            onClick={() => {
              setDateA(toDateValue(addToDate(new Date(), -30, 'day')));
              setDateB(nowInput());
            }}
          >
            最近 30 天
          </button>
          {diff ? (
            <div className="w-full font-mono text-sm">
              <span className="font-medium">
                {diff.diff.years} 年 {diff.diff.months} 个月 {diff.diff.days} 天{' '}
                {`${String(diff.diff.hours).padStart(2, '0')}:${String(
                  diff.diff.minutes,
                ).padStart(2, '0')}:${String(diff.diff.seconds).padStart(2, '0')}`}
              </span>
              <span className="opacity-50">
                {' '}· {diff.fromIsEarlier ? 'A 早于 B' : 'B 早于 A'} 共{' '}
                {diff.diff.totalDays} 天 / {diff.diff.totalWeeks} 周 /{' '}
                {diff.diff.totalHours} 小时 / {diff.diff.totalMinutes} 分钟 /{' '}
                {diff.diff.totalSeconds} 秒
              </span>
            </div>
          ) : null}
        </div>
      </Pane>

      <Pane label="加减天数" className="mb-4 min-h-32">
        <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 outline-none dark:border-white/10"
          />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={btn()} onClick={() => addDays(-1, 'day')}>
              -1 天
            </button>
            <button type="button" className={btn()} onClick={() => addDays(1, 'day')}>
              +1 天
            </button>
            <button type="button" className={btn()} onClick={() => addDays(7, 'day')}>
              +1 周
            </button>
            <button type="button" className={btn()} onClick={() => addDays(1, 'month')}>
              +1 月
            </button>
            <button type="button" className={btn()} onClick={() => addDays(1, 'year')}>
              +1 年
            </button>
            <button type="button" className={btn()} onClick={() => setBaseDate(today())}>
              回到今天
            </button>
          </div>
          {parsedBase.ok ? (
            <span className="w-full font-mono text-sm">
              {baseDate}（{weekdayName(parsedBase.value)}）
            </span>
          ) : null}
        </div>
      </Pane>

      <Pane label="倒数日" className="min-h-32">
        <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <input
            type="date"
            value={countdownTarget}
            onChange={(e) => setCountdownTarget(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 outline-none dark:border-white/10"
          />
          {parsedTarget.ok && countdown ? (
            <span className="font-mono text-sm">
              {countdown.fromIsEarlier
                ? `距离 ${formatDateTime(parsedTarget.value)}（${weekdayName(
                    parsedTarget.value,
                  )}）还有 ${diffSummary(countdown.diff)}`
                : '目标时间已过'}
            </span>
          ) : null}
        </div>
      </Pane>
    </ToolPage>
  );
}