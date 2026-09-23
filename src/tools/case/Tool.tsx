import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';

export type CaseStyle = 'camel' | 'snake' | 'kebab' | 'pascal' | 'constant' | 'title';

export function splitWords(input: string): string[] {
  const spaced = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim();
  if (!spaced) return [];
  return spaced.split(/\s+/).map((w) => w).filter(Boolean);
}

export function convertCase(input: string, style: CaseStyle): string {
  const words = splitWords(input).map((w) => w.toLowerCase());
  if (words.length === 0) return '';
  const cap = (w: string) => (w ? w[0]!.toUpperCase() + w.slice(1) : w);
  switch (style) {
    case 'camel':
      return words.map((w, i) => (i === 0 ? w : cap(w))).join('');
    case 'pascal':
      return words.map(cap).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    case 'constant':
      return words.join('_').toUpperCase();
    case 'title':
      return words.map(cap).join(' ');
  }
}

const styles: { id: CaseStyle; label: string; hint: string }[] = [
  { id: 'camel', label: '小驼峰（camelCase）', hint: '首个单词小写，其后单词首字母大写，如 userName；变量常用' },
  { id: 'pascal', label: '大驼峰（PascalCase）', hint: '每个单词首字母都大写，如 UserName；类名常用' },
  { id: 'snake', label: '下划线（snake_case）', hint: '单词全部小写，用下划线连接，如 user_name；Python / 数据库字段常用' },
  { id: 'kebab', label: '中划线（kebab-case）', hint: '单词全部小写，用中划线连接，如 user-name；URL、CSS 类名常用' },
  { id: 'constant', label: '常量（CONSTANT_CASE）', hint: '单词全部大写，用下划线连接，如 USER_NAME；常量定义常用' },
  { id: 'title', label: '标题（Title Case）', hint: '每个单词首字母大写，单词间留空格，如 User Name；标题、文档常用' },
];

export default function CaseTool() {
  const [input, setInput] = useState('hello world example');
  const [style, setStyle] = useState<CaseStyle>('camel');
  const outputs = useMemo(
    () => styles.map((s) => ({ ...s, value: convertCase(input, s.id) })),
    [input],
  );
  const active = outputs.find((o) => o.id === style);

  return (
    <ToolPage
      title="命名转换"
      desc="代码命名风格互转：小驼峰 / 大驼峰 / 下划线 / 中划线 / 常量 / 标题"
      actions={<CopyButton text={active?.value ?? ''} />}
    >
      <ErrorBanner message="" />
      <Pane label="输入" className="mb-4 min-h-24">
        <TextArea value={input} onChange={setInput} />
      </Pane>
      <div className="grid gap-2">
        {outputs.map((o) => (
          <div
            key={o.id}
            className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition ${
              style === o.id
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-black/10 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/5'
            }`}
            onClick={() => setStyle(o.id)}
          >
            <div className="min-w-0">
              <span className="block text-xs font-medium">{o.label}</span>
              <span className="mt-0.5 block truncate text-[11px] opacity-50">{o.hint}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm">{o.value || '—'}</code>
              <button
                type="button"
                className={btn()}
                onClick={(e) => {
                  e.stopPropagation();
                  setInput(o.value);
                }}
              >
                用作输入
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}
