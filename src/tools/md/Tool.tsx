import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';
import { renderMarkdown } from './core';

const SAMPLE = `# DevBox

本地优先的开发者工具箱。

## 功能

- **编码转换**：Base64 / URL / JSON
- **生成**：UUID / 密码 / 二维码
- **文本**：正则 / Diff / 统计

\`\`\`ts
const tools = 22;
console.log(tools); // 22
\`\`\`

| 工具 | 类别 |
| ---- | ---- |
| 时间戳 | 时间 |
| 单位换算 | 转换 |

> 所有数据在本地处理，无需联网。

[查看源码](https://github.com/xuanz54/DevBox) · *离线可用*
`;

export default function MdTool() {
  const [input, setInput] = useState(SAMPLE);
  const result = useMemo(() => renderMarkdown(input), [input]);

  return (
    <ToolPage
      title="Markdown 预览"
      desc="Markdown（一种用 * # - 等符号写格式的轻量标记语言）实时渲染为 HTML（网页超文本标记语言），可复制生成的 HTML"
      actions={
        <>
          <CopyButton text={result.ok ? result.value : ''} label="复制 HTML" />
          <button type="button" className={btn()} onClick={() => setInput('')}>
            清空
          </button>
          <button type="button" className={btn()} onClick={() => setInput(SAMPLE)}>
            示例
          </button>
        </>
      }
    >
      <ErrorBanner message={result.ok ? '' : result.error} />
      <div className="grid h-full min-h-0 grid-cols-2 gap-4">
        <Pane label="Markdown 源文（左边写，右边实时看效果）" className="min-h-80">
          <TextArea value={input} onChange={setInput} mono={false} />
        </Pane>
        <Pane label="预览（渲染后的网页效果）" className="min-h-80">
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div
              className="md-body text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: result.ok ? result.value : '' }}
            />
          </div>
        </Pane>
      </div>
      <style>{`
        .md-body h1 { font-size: 1.5rem; font-weight: 700; margin: 0.6rem 0 0.8rem; }
        .md-body h2 { font-size: 1.25rem; font-weight: 600; margin: 1.2rem 0 0.6rem; }
        .md-body h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .md-body p { margin: 0.5rem 0; }
        .md-body ul, .md-body ol { margin: 0.5rem 0; padding-left: 1.4rem; }
        .md-body ul { list-style: disc; }
        .md-body ol { list-style: decimal; }
        .md-body li { margin: 0.2rem 0; }
        .md-body a { color: #6366f1; text-decoration: underline; }
        .md-body strong { font-weight: 600; }
        .md-body em { font-style: italic; }
        .md-body blockquote {
          margin: 0.7rem 0; padding: 0.4rem 0.9rem;
          border-left: 3px solid rgba(99, 102, 241, 0.5); opacity: 0.85;
        }
        .md-body code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85em;
          background: rgba(120, 120, 160, 0.14);
          border-radius: 4px; padding: 0.1rem 0.3rem;
        }
        .md-body pre {
          margin: 0.7rem 0; padding: 0.7rem 0.9rem;
          border-radius: 8px; overflow: auto;
          background: rgba(120, 120, 160, 0.12);
        }
        .md-body pre code { background: transparent; padding: 0; }
        .md-body hr { margin: 1rem 0; border: none; border-top: 1px solid rgba(120, 120, 160, 0.3); }
        .md-body table { border-collapse: collapse; margin: 0.7rem 0; }
        .md-body th, .md-body td {
          border: 1px solid rgba(120, 120, 160, 0.3);
          padding: 0.3rem 0.7rem; text-align: left;
        }
        .md-body th { font-weight: 600; }
        .md-body img { max-width: 100%; border-radius: 8px; }
        .md-body .empty { color: rgba(120, 120, 160, 0.5); }
      `}</style>
    </ToolPage>
  );
}