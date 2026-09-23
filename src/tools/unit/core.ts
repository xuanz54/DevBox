import { err, ok, type Result } from '../../lib/result';

export interface UnitDef {
  key: string;
  label: string;
  symbol: string;
  factor: number;
}

export interface UnitCategory {
  key: string;
  label: string;
  units: UnitDef[];
}

const c = (key: string, label: string, symbol: string, factor: number): UnitDef => ({
  key,
  label,
  symbol,
  factor,
});

export const unitCategories: UnitCategory[] = [
  {
    key: 'length',
    label: '长度',
    units: [
      c('mm', '毫米', 'mm', 0.001),
      c('cm', '厘米', 'cm', 0.01),
      c('m', '米', 'm', 1),
      c('km', '千米', 'km', 1000),
      c('in', '英寸', 'in', 0.0254),
      c('ft', '英尺', 'ft', 0.3048),
      c('yd', '码', 'yd', 0.9144),
      c('mi', '英里', 'mi', 1609.344),
    ],
  },
  {
    key: 'weight',
    label: '重量',
    units: [
      c('mg', '毫克', 'mg', 0.000001),
      c('g', '克', 'g', 0.001),
      c('kg', '千克', 'kg', 1),
      c('t', '吨', 't', 1000),
      c('oz', '盎司', 'oz', 0.028349523125),
      c('lb', '磅', 'lb', 0.45359237),
      c('jin', '斤', '斤', 0.5),
      c('liang', '两', '两', 0.05),
    ],
  },
  {
    key: 'temperature',
    label: '温度',
    units: [
      c('c', '摄氏度', '°C', 1),
      c('f', '华氏度', '°F', 1),
      c('k', '开尔文', 'K', 1),
    ],
  },
  {
    key: 'area',
    label: '面积',
    units: [
      c('mm2', '平方毫米', 'mm²', 0.000001),
      c('cm2', '平方厘米', 'cm²', 0.0001),
      c('m2', '平方米', 'm²', 1),
      c('ha', '公顷', 'ha', 10000),
      c('km2', '平方千米', 'km²', 1000000),
      c('mu', '亩', '亩', 2000 / 3),
      c('ft2', '平方英尺', 'ft²', 0.09290304),
    ],
  },
  {
    key: 'volume',
    label: '体积',
    units: [
      c('ml', '毫升', 'ml', 0.001),
      c('l', '升', 'L', 1),
      c('m3', '立方米', 'm³', 1000),
      c('oz_fl', '美制液量', 'fl oz', 0.0295735295625),
      c('gal', '美制加仑', 'gal', 3.785411784),
      c('gal_uk', '英制加仑', 'gal', 4.54609),
    ],
  },
  {
    key: 'speed',
    label: '速度',
    units: [
      c('ms', '米/秒', 'm/s', 1),
      c('kmh', '千米/时', 'km/h', 1 / 3.6),
      c('mph', '英里/时', 'mi/h', 0.44704),
      c('kn', '节', 'kn', 0.5144444444444445),
      c('fts', '英尺/秒', 'ft/s', 0.3048),
    ],
  },
  {
    key: 'time',
    label: '时间',
    units: [
      c('ms', '毫秒', 'ms', 0.001),
      c('s', '秒', 's', 1),
      c('min', '分钟', 'min', 60),
      c('h', '小时', 'h', 3600),
      c('day', '天', 'd', 86400),
      c('week', '周', 'w', 604800),
    ],
  },
  {
    key: 'data',
    label: '数据',
    units: [
      c('bit', '比特', 'bit', 0.125),
      c('byte', '字节', 'B', 1),
      c('kb', '千字节', 'KB', 1000),
      c('mb', '兆字节', 'MB', 1000000),
      c('gb', '吉字节', 'GB', 1000000000),
      c('tb', '太字节', 'TB', 1000000000000),
      c('kib', '千比特', 'KiB', 1024),
      c('mib', '兆比特', 'MiB', 1048576),
      c('gib', '吉比特', 'GiB', 1073741824),
    ],
  },
];

function temperatureToCelsius(key: string, value: number): number {
  switch (key) {
    case 'f':
      return ((value - 32) * 5) / 9;
    case 'k':
      return value - 273.15;
    default:
      return value;
  }
}

function celsiusTo(value: number, key: string): number {
  switch (key) {
    case 'f':
      return (value * 9) / 5 + 32;
    case 'k':
      return value + 273.15;
    default:
      return value;
  }
}

export function findUnit(categoryKey: string, unitKey: string): UnitDef | null {
  const cat = unitCategories.find((x) => x.key === categoryKey);
  return cat?.units.find((u) => u.key === unitKey) ?? null;
}

export function convertUnit(
  categoryKey: string,
  value: number,
  fromKey: string,
  toKey: string,
): Result<number, string> {
  if (!Number.isFinite(value)) return err('请输入有效的数值');
  const cat = unitCategories.find((x) => x.key === categoryKey);
  if (!cat) return err('未知类别');
  const from = findUnit(categoryKey, fromKey);
  const to = findUnit(categoryKey, toKey);
  if (!from) return err('未知源单位');
  if (!to) return err('未知目标单位');

  let base: number;
  if (categoryKey === 'temperature') {
    base = temperatureToCelsius(fromKey, value);
    return ok(celsiusTo(base, toKey));
  }
  base = value * from.factor;
  return ok(base / to.factor);
}

export function formatUnitResult(value: number): string {
  if (Object.is(value, -0)) return '0';
  if (Math.abs(value) >= 1e9 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
    return value.toExponential(6);
  }
  const abs = Math.abs(value);
  const digits = abs >= 1e6 || abs < 1 ? 6 : abs >= 1e4 ? 4 : abs >= 100 ? 2 : 4;
  return String(Number(value.toFixed(digits)));
}

export function defaultFrom(categoryKey: string): string | null {
  const cat = unitCategories.find((x) => x.key === categoryKey);
  const first = cat?.units[0];
  return first ? first.key : null;
}