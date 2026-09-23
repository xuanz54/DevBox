import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { csvToJson, jsonToCsv } from './core';

const CSV_SAMPLE = `name,age,city
Alice,30,北京
Bob,25,上海
Carol,35,广州`;

const JSON_SAMPLE = JSON.stringify(
  [
    { name: 'Alice', age: 30, city: '北京' },
    { name: 'Bob', age: 25, city: '上海' },
    { name: 'Carol', age: 35, city: '广州' },
  ],
  null,
  2,
);

const DELIMITERS = [
  { key: ',', label: '逗号 ,' },
  { key: '\t', label: '制表符 Tab' },
  { key: ';', label: '分号 ;' },
] as const;

export default function CsvTool() {
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState(CSV_SAMPLE);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);

  const result = useMemo(() => {
    if (mode === 'csv2json') return csvToJson(input, delimiter, hasHeader);
    return jsonToCsv(input, delimiter);
  }, [mode, input, delimiter, hasHeader]);

  const isCsv = mode === 'csv2json';

  return (
    <ToolPage
      title="CSV ⇄ JSON"
      desc="表格数据与 JSON 互转"
      actions={
        <>
          <div className="flex overflow-hidden rounded-md border border-black/10 text-xs dark:border-white/10">
            {(
              [
                ['csv2json', 'CSV → JSON'],
                ['json2csv', 'JSON → CSV'],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setInput(m === 'csv2json' ? CSV_SAMPLE : JSON_SAMPLE);
                }}
                className={`px-2.5 py-1 ${
                  mode === m ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={btn()}
            onClick={() => {
              if (result.ok) {
                setInput(result.value);
                setMode(mode === 'csv2json' ? 'json2csv' : 'csv2json');
              }
            }}
            disabled={!result.ok}
          >
            结果→输入并翻转
          </button>
          <CopyButton text={result.ok ? result.value : ''} />
        </>
      }
    >
      <ErrorBanner message={result.ok ? '' : result.error} />

      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          分隔符
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-2 py-1.5 dark:border-white/10 dark:bg-white/5"
          >
            {DELIMITERS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        {isCsv ? (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
            />
            首行为表头
          </label>
        ) : null}
      </div>

      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label={isCsv ? 'CSV' : 'JSON'} className="min-h-64">
          <TextArea value={input} onChange={setInput} mono={isCsv} />
        </Pane>
        <Pane label={isCsv ? 'JSON' : 'CSV'} className="min-h-64">
          <TextArea value={result.ok ? result.value : ''} readOnly mono={!isCsv} />
        </Pane>
      </div>
      <div className="mt-3 flex gap-3">
        <button type="button" className={btn()} onClick={() => setInput('')}>
          清空
        </button>
        <button
          type="button"
          className={btn()}
          onClick={() => setInput(isCsv ? CSV_SAMPLE : JSON_SAMPLE)}
        >
          示例
        </button>
      </div>
    </ToolPage>
  );
}