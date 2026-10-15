import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBanner, ToolPage, btn } from '../../components/ui';
import {
  CURRENCIES,
  FX_API_BASE,
  FX_CACHE_KEY,
  convert,
  findCurrency,
  formatMoney,
  formatRate,
  isCacheStale,
  normalizeRates,
  parseAmount,
  parseSnapshot,
  unitRate,
  type FxSnapshot,
} from './core';

interface SelectProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}

function CurrencySelect({ value, onChange, id }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-black/10 bg-white px-2.5 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
    >
      {CURRENCIES.map((cur) => (
        <option key={cur.code} value={cur.code}>
          {cur.code} · {cur.name}
        </option>
      ))}
    </select>
  );
}

function readCache(): FxSnapshot | null {
  try {
    const parsed = parseSnapshot(localStorage.getItem(FX_CACHE_KEY));
    return parsed.ok ? parsed.value : null;
  } catch {
    return null;
  }
}

function writeCache(snapshot: FxSnapshot): void {
  try {
    localStorage.setItem(FX_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage may be full or blocked; cache is best-effort */
  }
}

export default function ExchangeTool() {
  const [amountText, setAmountText] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('CNY');
  const [snapshot, setSnapshot] = useState<FxSnapshot | null>(() => readCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${FX_API_BASE}/latest?base=USD`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        base?: unknown;
        date?: unknown;
        rates?: unknown;
      };
      if (
        typeof data.base !== 'string' ||
        typeof data.date !== 'string' ||
        typeof data.rates !== 'object' ||
        data.rates === null
      ) {
        throw new Error('接口返回格式异常');
      }
      const next: FxSnapshot = {
        base: data.base,
        date: data.date,
        rates: normalizeRates(data.base, data.rates as Record<string, number>),
        fetchedAt: Date.now(),
      };
      setSnapshot(next);
      writeCache(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        `获取汇率失败（${msg}）。请检查网络连接后重试。` +
          (readCache() ? '当前展示的是上次缓存的汇率。' : ''),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) setSnapshot(cached);
    if (!cached || isCacheStale(cached.fetchedAt)) {
      void refresh();
    }
  }, [refresh]);

  const amountParsed = useMemo(() => parseAmount(amountText), [amountText]);

  const converted = useMemo(() => {
    if (!snapshot || !amountParsed.ok) return null;
    return convert(amountParsed.value, from, to, snapshot.rates);
  }, [snapshot, amountParsed, from, to]);

  const rate = useMemo(() => {
    if (!snapshot) return null;
    return unitRate(from, to, snapshot.rates);
  }, [snapshot, from, to]);

  const stale = snapshot ? isCacheStale(snapshot.fetchedAt) : true;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const toDef = findCurrency(to);

  return (
    <ToolPage
      title="汇率换算"
      desc="实时汇率换算（欧洲央行参考汇率，每工作日更新）；缓存后离线可用"
      actions={
        <button type="button" className={btn()} onClick={() => void refresh()} disabled={loading}>
          {loading ? '刷新中…' : '刷新汇率'}
        </button>
      }
    >
      <ErrorBanner message={error} />

      {!snapshot && !loading && !error ? (
        <ErrorBanner message="正在准备汇率数据…" />
      ) : null}

      {snapshot && stale && !error ? (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          缓存的汇率已超过 24 小时，可能不是最新，点右上角「刷新汇率」获取当前数据。
        </div>
      ) : null}

      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs opacity-60">
              <span>金额</span>
              <input
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                inputMode="decimal"
                spellCheck={false}
                placeholder="输入金额"
                className="rounded-md border border-black/10 bg-transparent px-2.5 py-2 text-base outline-none focus:border-indigo-400 dark:border-white/10"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs opacity-60">
              <span>从</span>
              <CurrencySelect value={from} onChange={setFrom} />
            </label>
            <button
              type="button"
              onClick={swap}
              title="交换币种"
              className="mb-0.5 rounded-md border border-black/10 bg-white px-2.5 py-2 text-sm hover:border-indigo-400 dark:border-white/10 dark:bg-white/5"
            >
              ⇄
            </button>
            <label className="flex flex-col gap-1 text-xs opacity-60">
              <span>到</span>
              <CurrencySelect value={to} onChange={setTo} />
            </label>
          </div>

          <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
            {amountParsed.ok && converted?.ok ? (
              <>
                <div className="text-3xl font-semibold tracking-tight">
                  {formatMoney(converted.value, to)}{' '}
                  <span className="text-base font-normal opacity-60">{to}</span>
                </div>
                <div className="mt-1 text-sm opacity-60">{toDef?.name}</div>
              </>
            ) : (
              <div className="text-3xl font-semibold tracking-tight opacity-30">—</div>
            )}

            <div className="mt-3 space-y-1 text-xs opacity-60">
              {rate?.ok ? (
                <div>
                  汇率：1 {from} = {formatRate(rate.value)} {to}
                </div>
              ) : (
                <div>汇率：—</div>
              )}
              {snapshot ? (
                <div>
                  数据日期：{snapshot.date}（欧洲央行参考汇率）
                  {stale ? ' · 已过期' : ''}
                </div>
              ) : (
                <div>数据日期：—</div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs opacity-50">
          汇率来源于{' '}
          <a
            href="https://frankfurter.dev"
            className="underline hover:text-indigo-500"
          >
            frankfurter.dev
          </a>
          （免费、无需 API Key），仅在刷新时联网；换算计算全部在本地完成。
        </p>
      </div>
    </ToolPage>
  );
}
