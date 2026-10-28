import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { decodeHtmlEntities, encodeHtmlEntities } from './core';

export default function HtmlEntityTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('<div class="box">你好 & \'world\'</div>');

  const result = useMemo(
    () => (mode === 'encode' ? { ok: true as const, value: encodeHtmlEntities(input) } : decodeHtmlEntities(input)),
    [mode, input],
  );
  const output = result.ok ? result.value : '';
  const error = result.ok ? '' : result.error;

  return (
    <ToolPage
      title="HTML 实体"
      desc="HTML 实体（Entity，网页里用 &名字; 或 &#数字; 写法表示 < > & 等特殊字符）转义与还原"
      actions={
        <>
          <div className="seg">
            {(
              [
                ['encode', '转义'],
                ['decode', '还原'],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`seg-btn${mode === m ? ' seg-on' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={btn()}
            onClick={() => {
              if (output) setInput(output);
              setMode(mode === 'encode' ? 'decode' : 'encode');
            }}
          >
            翻转
          </button>
          <CopyButton text={output} />
        </>
      }
    >
      <ErrorBanner message={error} />
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <Pane label="输入" className="min-h-64">
          <TextArea value={input} onChange={setInput} />
        </Pane>
        <Pane label="输出" className="min-h-64">
          <TextArea value={output} readOnly />
        </Pane>
      </div>
    </ToolPage>
  );
}
