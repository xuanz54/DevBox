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
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
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
    </ToolPage>
  );
}