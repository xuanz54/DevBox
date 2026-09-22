import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { diffLines, prettyForDiff, summarizeDiff } from './core';

const leftSample = '{\n  "a": 1,\n  "b": 2\n}';
const rightSample = '{\n  "a": 1,\n  "b": 3,\n  "c": 4\n}';

export default function JsonDiffTool() {
  const [left, setLeft] = useState(leftSample);
  const [right, setRight] = useState(rightSample);

  const prettyLeft = useMemo(() => prettyForDiff(left), [left]);
  const prettyRight = useMemo(() => prettyForDiff(right), [right]);
  const error = !prettyLeft.ok
    ? `左侧：${prettyLeft.error}`
    : !prettyRight.ok
      ? `右侧：${prettyRight.error}`
      : '';

  const lines = useMemo(() => {
    if (!prettyLeft.ok || !prettyRight.ok) return [];
    return diffLines(prettyLeft.value, prettyRight.value);
  }, [prettyLeft, prettyRight]);

  const sum = summarizeDiff(lines);
  const unified = lines
    .map((l) => `${l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' '} ${l.text}`)
    .join('\n');

  return (
    <ToolPage
      title="JSON 对比"
      desc="格式化后按行对比差异"
      actions={
        <>
          <span className="text-xs">
            <span className="text-emerald-500">+{sum.added}</span>{' '}
            <span className="text-red-500">-{sum.removed}</span>{' '}
            <span className="opacity-50">={sum.same}</span>
          </span>
          <CopyButton text={unified} label="复制差异" />
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
        </>
      }
    >
      <ErrorBanner message={error} />
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label="左侧 JSON" className="min-h-56">
          <TextArea value={left} onChange={setLeft} />
        </Pane>
        <Pane label="右侧 JSON" className="min-h-56">
          <TextArea value={right} onChange={setRight} />
        </Pane>
      </div>
      <div className="mt-4">
        <Pane label="差异（+ 新增 / - 删除）" className="min-h-40">
          <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs leading-5">
            {error
              ? null
              : lines.length === 0
                ? '（空）'
                : lines.map((l, i) => (
                    <div
                      key={`${i}-${l.type}`}
                      className={
                        l.type === 'add'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : l.type === 'del'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-300'
                            : 'opacity-70'
                      }
                    >
                      {l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}
                      {l.text}
                    </div>
                  ))}
          </div>
        </Pane>
      </div>
    </ToolPage>
  );
}
