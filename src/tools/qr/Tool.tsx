import { useEffect, useRef, useState } from 'react';
import { CopyButton, ErrorBanner, ToolPage, btn } from '../../components/ui';
import { saveImageFile } from '../../components/ui';
import { type EcLevel, generateQrDataUrl } from './core';

const EC_LEVELS: { key: EcLevel; label: string }[] = [
  { key: 'L', label: 'L（约 7%）' },
  { key: 'M', label: 'M（约 15%）' },
  { key: 'Q', label: 'Q（约 25%）' },
  { key: 'H', label: 'H（约 30%）' },
];

export default function QrTool() {
  const [text, setText] = useState('https://github.com/xuanz54/DevBox');
  const [size, setSize] = useState(280);
  const [ec, setEc] = useState<EcLevel>('M');
  const [dark, setDark] = useState('#000000');
  const [light, setLight] = useState('#ffffff');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      setError('');
      if (!text.trim()) {
        setDataUrl('');
        return;
      }
      void generateQrDataUrl(text, { size, errorCorrectionLevel: ec, dark, light }).then(
        (r) => {
          if (r.ok) setDataUrl(r.value);
          else {
            setDataUrl('');
            setError(r.error);
          }
        },
      );
    }, 250);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [text, size, ec, dark, light]);

  const doSave = async () => {
    if (!dataUrl) return;
    const okSave = await saveImageFile('qr.png', dataUrl);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
    if (!okSave) setError('保存失败');
  };

  return (
    <ToolPage
      title="二维码生成"
      desc="文本 / 链接生成二维码，本地渲染并导出 PNG"
      actions={
        <>
          <CopyButton text={text} label="复制内容" />
          <button
            type="button"
            className={btn(true)}
            onClick={() => void doSave()}
            disabled={!dataUrl}
          >
            {saved ? '已保存' : '保存 PNG'}
          </button>
        </>
      }
    >
      <ErrorBanner message={error} />

      <div className="mb-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">尺寸 px</span>
          <input
            type="number"
            min={96}
            max={1024}
            step={8}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 rounded-md border border-black/10 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">容错级别</span>
          <select
            value={ec}
            onChange={(e) => setEc(e.target.value as EcLevel)}
            className="rounded-md border border-black/10 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {EC_LEVELS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">前景色</span>
          <input
            type="color"
            value={dark}
            onChange={(e) => setDark(e.target.value)}
            className="h-8 w-14 cursor-pointer rounded-md border border-black/10 bg-white p-0.5 dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">背景色</span>
          <input
            type="color"
            value={light}
            onChange={(e) => setLight(e.target.value)}
            className="h-8 w-14 cursor-pointer rounded-md border border-black/10 bg-white p-0.5 dark:border-white/10"
          />
        </label>
      </div>

      <div className="grid h-full min-h-0 gap-4 md:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-black/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide opacity-50 dark:border-white/10">
            内容
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="min-h-40 w-full flex-1 resize-none bg-transparent px-3 py-2 font-mono text-sm outline-none"
          />
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="二维码"
              width={Math.min(size, 320)}
              height={Math.min(size, 320)}
              className="rounded-lg shadow"
            />
          ) : (
            <span className="text-sm opacity-40">输入内容以生成二维码…</span>
          )}
        </div>
      </div>
    </ToolPage>
  );
}