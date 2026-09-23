import { useRef, useState } from 'react';
import { ErrorBanner, ToolPage, TextArea, btn } from '../../components/ui';
import { cryptoRandomInt, pickRandom, shuffle, splitOptions } from './core';

interface PickItem {
  value: string;
  time: string;
}

export default function RandomTool() {
  const [text, setText] = useState('火锅\n烧烤\n日料\n川菜\n披萨');
  const [current, setCurrent] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [history, setHistory] = useState<PickItem[]>([]);
  const [shuffled, setShuffled] = useState<string[] | null>(null);
  const timer = useRef<number | null>(null);

  const options = splitOptions(text);

  const startPick = () => {
    if (options.length === 0 || picking) return;
    if (timer.current) window.clearInterval(timer.current);
    setPicking(true);
    setShuffled(null);
    let ticks = 0;
    const total = 12 + Math.floor(Math.random() * 5);
    timer.current = window.setInterval(() => {
      ticks += 1;
      setCurrent(options[cryptoRandomInt(options.length)] ?? (options[0] ?? ''));
      if (ticks >= total && timer.current) {
        window.clearInterval(timer.current);
        const r = pickRandom(options);
        const value = r.ok ? r.value : '';
        setCurrent(value);
        setPicking(false);
        if (value) {
          setHistory((h) =>
            [
              { value, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
              ...h,
            ].slice(0, 12),
          );
        }
      }
    }, 70);
  };

  const doShuffle = () => {
    if (options.length === 0) return;
    setShuffled(shuffle(options));
  };

  return (
    <ToolPage
      title="随机决策"
      desc="从选项列表中随机抽取 / 打乱，使用加密安全随机数"
      actions={
        <>
          <button type="button" className={btn()} onClick={doShuffle} disabled={options.length === 0}>
            打乱顺序
          </button>
          <button
            type="button"
            className={btn(true)}
            onClick={startPick}
            disabled={options.length === 0 || picking}
          >
            {picking ? '抽取中…' : '抽取一次'}
          </button>
        </>
      }
    >
      <ErrorBanner message={options.length === 0 ? '至少填入一个选项' : ''} />

      <div className="grid h-full min-h-0 gap-4 md:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between border-b border-black/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide opacity-50 dark:border-white/10">
            <span>选项（每行一条，也可用逗号分隔）</span>
            <span>{options.length} 项</span>
          </div>
          <TextArea value={text} onChange={setText} mono={false} />
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            {current ? (
              <div
                className={`break-all text-center text-2xl font-semibold ${picking ? 'opacity-70' : ''}`}
              >
                {current}
              </div>
            ) : (
              <span className="text-sm opacity-40">填写选项后点击「抽取一次」…</span>
            )}
          </div>

          {shuffled ? (
            <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wide opacity-50">
                打乱结果
              </div>
              <ol className="flex flex-col gap-1 font-mono text-sm">
                {shuffled.map((s, i) => (
                  <li key={i} className="opacity-80">
                    {i + 1}. {s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide opacity-50">
              <span>抽取历史</span>
              <button
                type="button"
                className="text-xs opacity-80 hover:opacity-100"
                onClick={() => setHistory([])}
                disabled={history.length === 0}
              >
                清空
              </button>
            </div>
            {history.length === 0 ? (
              <span className="text-xs opacity-40">暂无记录</span>
            ) : (
              <div className="flex flex-col gap-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="break-all">{h.value}</span>
                    <span className="shrink-0 font-mono text-xs opacity-40">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}