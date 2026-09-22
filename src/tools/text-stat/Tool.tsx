import { useMemo, useState } from 'react';
import { CopyButton, Pane, TextArea, ToolPage, btn } from '../../components/ui';

export interface TextStats {
  chars: number;
  charsNoSpace: number;
  lines: number;
  words: number;
  chinese: number;
  asciiLetters: number;
  digits: number;
  spaces: number;
}

export function computeTextStats(text: string): TextStats {
  if (text === '') {
    return {
      chars: 0,
      charsNoSpace: 0,
      lines: 0,
      words: 0,
      chinese: 0,
      asciiLetters: 0,
      digits: 0,
      spaces: 0,
    };
  }
  const lines = text.split(/\r\n|\r|\n/).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  let chinese = 0;
  let asciiLetters = 0;
  let digits = 0;
  let spaces = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) spaces++;
    if (/[一-鿿]/.test(ch)) chinese++;
    else if (/[a-zA-Z]/.test(ch)) asciiLetters++;
    else if (/[0-9]/.test(ch)) digits++;
  }
  return {
    chars: [...text].length,
    charsNoSpace: [...text].filter((c) => !/\s/.test(c)).length,
    lines,
    words,
    chinese,
    asciiLetters,
    digits,
    spaces,
  };
}

export default function TextStatTool() {
  const [text, setText] = useState('Hello 世界\nDevBox 2026');
  const stats = useMemo(() => computeTextStats(text), [text]);
  const summary = JSON.stringify(stats, null, 2);

  const cards: { label: string; value: number }[] = [
    { label: '字符（含空白）', value: stats.chars },
    { label: '字符（不含空白）', value: stats.charsNoSpace },
    { label: '行数', value: stats.lines },
    { label: '词数', value: stats.words },
    { label: '汉字', value: stats.chinese },
    { label: '英文字母', value: stats.asciiLetters },
    { label: '数字', value: stats.digits },
    { label: '空白字符', value: stats.spaces },
  ];

  return (
    <ToolPage
      title="文本统计"
      desc="字数、行数与字符构成"
      actions={<CopyButton text={summary} label="复制统计" />}
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-[11px] opacity-50">{c.label}</div>
            <div className="mt-1 font-mono text-xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
      <Pane label="文本" className="min-h-56">
        <TextArea value={text} onChange={setText} mono={false} />
      </Pane>
      <button type="button" className={`${btn()} mt-3`} onClick={() => setText('')}>
        清空
      </button>
    </ToolPage>
  );
}
