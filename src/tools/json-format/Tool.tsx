import { useMemo, useState } from 'react';
import {
  CopyButton,
  ErrorBanner,
  Pane,
  TextArea,
  ToolPage,
  btn,
  pickTextFile,
  saveTextFile,
} from '../../components/ui';
import { compressJson, formatJson } from './core';

const sample = '{\n  "name": "DevBox",\n  "tools": 16,\n  "ok": true\n}';

export default function JsonFormatTool() {
  const [input, setInput] = useState(sample);
  const [indent, setIndent] = useState(2);
  const [notice, setNotice] = useState('');

  const formatted = useMemo(() => formatJson(input, { indent }), [input, indent]);
  const compressed = useMemo(() => compressJson(input), [input]);

  const output = formatted.ok ? formatted.value : '';
  const error = formatted.ok ? '' : formatted.error;

  return (
    <ToolPage
      title="JSON 格式化"
      desc="校验、缩进格式化、一键压缩"
      actions={
        <>
          <label className="flex items-center gap-1 text-xs opacity-70">
            缩进
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="input input-sm"
            >
              {[0, 2, 4, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={btn()}
            onClick={() => setInput(compressed.ok ? compressed.value : input)}
            disabled={!compressed.ok}
          >
            压缩到输入
          </button>
          <button
            type="button"
            className={btn()}
            onClick={() => {
              void pickTextFile().then((f) => {
                if (f) {
                  setInput(f.content);
                  setNotice(`已加载 ${f.name}`);
                  window.setTimeout(() => setNotice(''), 2000);
                }
              });
            }}
          >
            打开…
          </button>
          <button
            type="button"
            className={btn()}
            disabled={!formatted.ok}
            onClick={() => {
              void saveTextFile('formatted.json', output).then((ok) => {
                setNotice(ok ? '已保存' : '保存取消/失败');
                window.setTimeout(() => setNotice(''), 2000);
              });
            }}
          >
            保存结果…
          </button>
          <CopyButton text={output} />
        </>
      }
    >
      <ErrorBanner message={error} />
      {notice ? (
        <div className="notice notice-ok">
          {notice}
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <Pane label="输入" className="min-h-64">
          <TextArea value={input} onChange={setInput} placeholder="粘贴 JSON…" />
        </Pane>
        <Pane label="输出" className="min-h-64">
          <TextArea value={output} readOnly placeholder="格式化结果" />
        </Pane>
      </div>
    </ToolPage>
  );
}
