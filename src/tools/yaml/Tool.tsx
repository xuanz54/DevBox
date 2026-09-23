import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { jsonToYaml, yamlToJson } from './core';

const YAML_SAMPLE = `name: DevBox
version: 1.0.0
tags:
  - toolbox
  - offline
config:
  theme: light
  features:
    editor: true
    sync: false
`;

const JSON_SAMPLE = JSON.stringify(
  {
    name: 'DevBox',
    version: '1.0.0',
    tags: ['toolbox', 'offline'],
    config: { theme: 'light', features: { editor: true, sync: false } },
  },
  null,
  2,
);

export default function YamlTool() {
  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [input, setInput] = useState(YAML_SAMPLE);

  const result = useMemo(() => {
    if (mode === 'yaml2json') return yamlToJson(input);
    return jsonToYaml(input);
  }, [mode, input]);

  const isYaml = mode === 'yaml2json';

  return (
    <ToolPage
      title="YAML ⇄ JSON"
      desc="配置文件格式互转：YAML（一种靠缩进排版、常用写配置文件的格式）与 JSON（JavaScript 对象表示法，前后端交换数据最常用的格式）互转"
      actions={
        <>
          <div className="flex overflow-hidden rounded-md border border-black/10 text-xs dark:border-white/10">
            {(
              [
                ['yaml2json', 'YAML → JSON'],
                ['json2yaml', 'JSON → YAML'],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setInput(m === 'yaml2json' ? YAML_SAMPLE : JSON_SAMPLE);
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
                setMode(mode === 'yaml2json' ? 'json2yaml' : 'yaml2json');
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
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label={isYaml ? 'YAML' : 'JSON'} className="min-h-64">
          <TextArea value={input} onChange={setInput} />
        </Pane>
        <Pane label={isYaml ? 'JSON' : 'YAML'} className="min-h-64">
          <TextArea value={result.ok ? result.value : ''} readOnly />
        </Pane>
      </div>
      <div className="mt-3 flex gap-3">
        <button type="button" className={btn()} onClick={() => setInput('')}>
          清空
        </button>
        <button
          type="button"
          className={btn()}
          onClick={() => setInput(isYaml ? YAML_SAMPLE : JSON_SAMPLE)}
        >
          示例
        </button>
      </div>
    </ToolPage>
  );
}