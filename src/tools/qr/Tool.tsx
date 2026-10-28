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
            className="input w-24"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">容错级别</span>
          <select
            value={ec}
            onChange={(e) => setEc(e.target.value as EcLevel)}
            className="input"
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
            className="swatch"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs opacity-50">背景色</span>
          <input
            type="color"
            value={light}
            onChange={(e) => setLight(e.target.value)}
            className="swatch"
          />
        </label>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
        <div className="pane">
          <div className="pane-head">
            内容
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="min-h-40 w-full flex-1 resize-none bg-transparent px-3 py-2 font-mono text-sm outline-none"
          />
        </div>
        <div className="panel p-6 flex flex-col items-center justify-center">
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