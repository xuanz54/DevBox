# DevBox

本地优先的开发者工具箱（桌面绿色单文件 exe）。基于 **Neutralino.js + React + Vite + Tailwind CSS**，所有数据本地处理，无需联网。

## 功能（23）

| 分类 | 工具 |
|---|---|
| 编码/转换 | JSON 格式化、JSON 对比、Base64、URL 编解码、HTML 实体、进制转换、JWT 解析、单位换算、YAML ⇄ JSON、CSV ⇄ JSON |
| 时间 | 时间戳、日期计算 |
| 文本 | 正则测试、文本 Diff、文本统计、命名转换、Markdown 预览 |
| 生成/哈希 | 哈希计算、UUID、密码生成、二维码生成、随机决策、颜色工具 |

其他：全局搜索（Ctrl+K）、亮暗主题、剪贴板/文件打开保存（桌面端原生对话框）。界面文案以中文为主，专有名词均附中文解释。

## 环境要求

- Node.js 20+
- Neutralino CLI：`npm i -g @neutralinojs/neu`
- Windows 上需 WebView2 运行时（Win11 通常自带）

## 开发

```bash
npm install
npm run dev          # 仅浏览器调试 UI
npm run typecheck
npm test
neu run              # 桌面窗口 + Vite HMR
```

## 打包绿色 exe

```bash
npm run build
neu build --embed-resources --release
```

产物在 `dist/`：

- `DevBox-win_x64.exe`（**单文件、免安装**，资源已内嵌）
- 对应平台二进制 + `resources.neu`（若未 embed 则为分离资源）

## 目录结构

```
src/
  components/     # 通用 UI（复制、面板、文件/剪贴板）
  lib/            # Result 等基础类型
  stores/         # zustand（主题）
  tools/          # 每个工具：core.ts（纯逻辑+可测）+ Tool.tsx（UI）
resources/        # Neutralino 资源（Vite 构建输出 + 图标 + client）
neutralino.config.json
```

## 约定

- 纯逻辑与 UI 分离，单测只测 core 导出的纯函数
- 界面文案用中文，英文专有名词需附中文名称或解释
- 无 Webhook / 无云同步 / 无账号
