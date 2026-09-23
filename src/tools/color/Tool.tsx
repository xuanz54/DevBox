import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, ToolPage, btn } from '../../components/ui';
import {
  contrastRatio,
  formatHsl,
  formatRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  wcagRating,
  type Rgb,
} from './core';

const RATING_META: Record<string, { label: string; cls: string }> = {
  AAA: { label: 'AAA（≥7:1）', cls: 'bg-emerald-500 text-white' },
  'AA': { label: 'AA（≥4.5:1）', cls: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' },
  'AA-Large': { label: 'AA 大字号（≥3:1）', cls: 'bg-amber-500/20 text-amber-600 dark:text-amber-300' },
  'Fail': { label: '未达标', cls: 'bg-red-500/20 text-red-600 dark:text-red-300' },
};

function SwatchRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="opacity-60">{label}</span>
      <div className="flex items-center gap-2">
        <CopyButton text={value} label="复制" />
        <code className="font-mono">{value}</code>
      </div>
    </div>
  );
}

export default function ColorTool() {
  const [input, setInput] = useState('#6366f1');
  const [colorA, setColorA] = useState('#ffffff');
  const [colorB, setColorB] = useState('#1f2937');

  const parsed = useMemo(() => parseColor(input), [input]);
  const hex = parsed.ok ? rgbToHex(parsed.value) : '';
  const hsl = parsed.ok ? rgbToHsl(parsed.value) : null;
  const parsedA = useMemo(() => parseColor(colorA), [colorA]);
  const parsedB = useMemo(() => parseColor(colorB), [colorB]);
  const ratio =
    parsedA.ok && parsedB.ok ? contrastRatio(parsedA.value, parsedB.value) : null;
  const rating = ratio !== null ? wcagRating(ratio) : null;

  const displayRgb = (rgb: Rgb): string => rgbToHex(rgb);

  return (
    <ToolPage
      title="颜色工具"
      desc="颜色格式互转与对比度检查：HEX（十六进制如 #6366f1）、RGB（红绿蓝三原色数值）、HSL（色相/饱和度/亮度）互转；对比度用 WCAG（网页内容无障碍指南）标准，≥4.5:1 适合正文、≥3:1 适合大字或图形"
      actions={
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={parsed.ok && /^#[0-9a-f]{6}$/.test(hex) ? hex : '#6366f1'}
            onChange={(e) => setInput(e.target.value)}
            className="h-8 w-14 cursor-pointer rounded-md border border-black/10 bg-white p-0.5 dark:border-white/10"
            title="取色器"
          />
          <button type="button" className={btn()} onClick={() => setInput('#6366f1')}>
            示例
          </button>
        </div>
      }
    >
      <div className="grid h-full min-h-0 gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="h-12 w-12 shrink-0 rounded-lg border border-black/10 dark:border-white/10"
                style={{ background: parsed.ok ? displayRgb(parsed.value) : 'transparent' }}
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10"
                placeholder="#6366f1 / rgb(99,102,241) / hsl(239,84%,67%)"
              />
            </div>
            <ErrorBanner message={parsed.ok ? '' : parsed.error} />
            {parsed.ok ? (
              <div className="flex flex-col gap-2">
                <SwatchRow label="十六进制 HEX" value={hex} />
                <SwatchRow label="红绿蓝 RGB" value={formatRgb(parsed.value)} />
                {hsl ? <SwatchRow label="色相饱和度亮度 HSL" value={formatHsl(hsl)} /> : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 text-xs opacity-50">
                  对比度检查（WCAG，网页内容无障碍指南）：检查两个颜色搭配够不够清晰易读
                </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <input
                type="color"
                value={parsedA.ok ? displayRgb(parsedA.value) : '#ffffff'}
                onChange={(e) => setColorA(e.target.value)}
                className="h-8 w-14 cursor-pointer rounded-md border border-black/10 bg-white p-0.5 dark:border-white/10"
              />
              <input
                value={colorA}
                onChange={(e) => setColorA(e.target.value)}
                spellCheck={false}
                className="w-28 rounded-md border border-black/10 bg-transparent px-2 py-1.5 font-mono text-xs outline-none dark:border-white/10"
              />
              <span className="opacity-50">vs</span>
              <input
                type="color"
                value={parsedB.ok ? displayRgb(parsedB.value) : '#1f2937'}
                onChange={(e) => setColorB(e.target.value)}
                className="h-8 w-14 cursor-pointer rounded-md border border-black/10 bg-white p-0.5 dark:border-white/10"
              />
              <input
                value={colorB}
                onChange={(e) => setColorB(e.target.value)}
                spellCheck={false}
                className="w-28 rounded-md border border-black/10 bg-transparent px-2 py-1.5 font-mono text-xs outline-none dark:border-white/10"
              />
            </div>
            {ratio !== null && rating ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm">
                  对比度 <strong>{ratio.toFixed(2)} : 1</strong>（数字越大越清晰）
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${RATING_META[rating]?.cls ?? ''}`}
                >
                  {RATING_META[rating]?.label ?? rating}
                </span>
              </div>
            ) : null}
            {parsedA.ok && parsedB.ok ? (
              <div className="mt-3 grid gap-2 text-xs">
                <div
                  className="rounded-lg p-3"
                  style={{ background: displayRgb(parsedB.value), color: displayRgb(parsedA.value) }}
                >
                  前景 A 在背景 B 上（正常 / 大字号 / 图形）
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ background: displayRgb(parsedA.value), color: displayRgb(parsedB.value) }}
                >
                  前景 B 在背景 A 上（正常 / 大字号 / 图形）
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}