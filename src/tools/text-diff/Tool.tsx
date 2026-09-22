import { useMemo, useState } from 'react';
import { CopyButton, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { diffLines, summarizeDiff } from '../json-diff/core';

export default function TextDiffTool() {
  const [left, setLeft] = useState('line one\nline two\nline three');
  const [right, setRight] = useState('line one\nline 2\nline three\nline four');

  const lines = useMemo(() => diffLines(left, right), [left, right]);
  const sum = summarizeDiff(lines);
  const unified = lines
    .map((l) => `${l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' '} ${l.text}`)
    .join('\n');

  return (
    <ToolPage
      title="文本 Diff"
      desc="行级差异对比（LCS）"
      actions={
        <>
          <span className="text-xs">
            <span className="text-emerald-500">+{sum.added}</span>{' '}
            <span className="text-red-500">-{sum.removed}</span>
          </span>
          <CopyButton text={unified} label="复制" />
        </>
      }
    >
      <div className="grid min-h-40 grid-cols-2 gap-4">
        <Pane label="左侧" className="min-h-40">
          <TextArea value={left} onChange={setLeft} />
        </Pane>
        <Pane label="右侧" className="min-h-40">
          <TextArea value={right} onChange={setRight} />
        </Pane>
      </div>
      <div className="mt-4">
        <Pane label="差异" className="min-h-36">
          <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs leading-5">
            {lines.map((l, i) => (
              <div
                key={i}
                className={
                  l.type === 'add'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    : l.type === 'del'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-300'
                      : 'opacity-70'
                }
              >
                {l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}
                {l.text || '∅'}
              </div>
            ))}
          </div>
        </Pane>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={btn()}
          onClick={() => {
            setLeft(right);
            setRight(left);
          }}
        >
          交换
        </button>
        <button type="button" className={btn()} onClick={() => { setLeft(''); setRight(''); }}>
          清空
        </button>
      </div>
    </ToolPage>
  );
}
