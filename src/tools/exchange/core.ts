import { err, ok, type Result } from '../../lib/result';

export interface CurrencyDef {
  code: string;
  name: string;
  decimals: number;
}

const c = (code: string, name: string, decimals = 2): CurrencyDef => ({
  code,
  name,
  decimals,
});

export const CURRENCIES: CurrencyDef[] = [
  c('CNY', '人民币'),
  c('USD', '美元'),
  c('EUR', '欧元'),
  c('JPY', '日元', 0),
  c('GBP', '英镑'),
  c('HKD', '港元'),
  c('KRW', '韩元', 0),
  c('SGD', '新加坡元'),
  c('AUD', '澳元'),
  c('CAD', '加元'),
  c('CHF', '瑞士法郎'),
  c('NZD', '新西兰元'),
  c('THB', '泰铢'),
  c('MYR', '马来西亚林吉特'),
  c('IDR', '印尼卢比', 0),
  c('INR', '印度卢比'),
  c('PHP', '菲律宾比索'),
  c('TRY', '土耳其里拉'),
  c('BRL', '巴西雷亚尔'),
  c('ZAR', '南非兰特'),
  c('MXN', '墨西哥比索'),
  c('PLN', '波兰兹罗提'),
  c('SEK', '瑞典克朗'),
  c('NOK', '挪威克朗'),
  c('DKK', '丹麦克朗'),
];

export function findCurrency(code: string): CurrencyDef | undefined {
  return CURRENCIES.find((cur) => cur.code === code);
}

export interface FxSnapshot {
  base: string;
  date: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

export const FX_CACHE_KEY = 'devbox.fx.v1';
export const FX_STALE_HOURS = 24;
export const FX_API_BASE = 'https://api.frankfurter.dev/v1';

export function normalizeRates(
  base: string,
  rates: Record<string, number>,
): Record<string, number> {
  return { ...rates, [base]: 1 };
}

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): Result<number> {
  if (!Number.isFinite(amount)) return err('金额不是有效数字');
  const fromRate = rates[from];
  const toRate = rates[to];
  if (fromRate == null || !Number.isFinite(fromRate) || fromRate <= 0) {
    return err(`缺少 ${from} 的汇率数据`);
  }
  if (toRate == null || !Number.isFinite(toRate) || toRate <= 0) {
    return err(`缺少 ${to} 的汇率数据`);
  }
  return ok((amount * toRate) / fromRate);
}

export function unitRate(
  from: string,
  to: string,
  rates: Record<string, number>,
): Result<number> {
  return convert(1, from, to, rates);
}

export function parseAmount(text: string): Result<number> {
  const trimmed = text.trim();
  if (trimmed === '') return err('请输入金额');
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return err('金额不是有效数字');
  return ok(value);
}

export function formatMoney(value: number, code: string): string {
  const decimals = findCurrency(code)?.decimals ?? 2;
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return '—';
  const abs = Math.abs(rate);
  let digits: number;
  if (abs === 0) digits = 2;
  else if (abs >= 100) digits = 2;
  else if (abs >= 1) digits = 4;
  else digits = 6;
  return rate.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function isCacheStale(
  fetchedAt: number,
  now: number = Date.now(),
  maxAgeHours: number = FX_STALE_HOURS,
): boolean {
  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0) return true;
  return now - fetchedAt > maxAgeHours * 3600_000;
}

export function parseSnapshot(raw: string | null): Result<FxSnapshot> {
  if (raw == null || raw === '') return err('没有缓存');
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return err('缓存数据损坏');
  }
  if (typeof data !== 'object' || data === null) return err('缓存数据损坏');
  const obj = data as Record<string, unknown>;
  if (typeof obj.base !== 'string' || obj.base === '') return err('缓存数据损坏');
  if (typeof obj.date !== 'string' || obj.date === '') return err('缓存数据损坏');
  if (typeof obj.fetchedAt !== 'number') return err('缓存数据损坏');
  const ratesRaw = obj.rates;
  if (typeof ratesRaw !== 'object' || ratesRaw === null) return err('缓存数据损坏');
  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(ratesRaw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      rates[code] = value;
    }
  }
  return ok({ base: obj.base, date: obj.date, rates, fetchedAt: obj.fetchedAt });
}
