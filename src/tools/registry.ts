export type ToolCategory = 'encode' | 'time' | 'text' | 'gen';

export interface ToolDef {
  id: string;
  path: string;
  name: string;
  desc: string;
  category: ToolCategory;
  keywords: string[];
}

export const categoryLabels: Record<ToolCategory, string> = {
  encode: '编码 / 转换',
  time: '时间',
  text: '文本',
  gen: '生成 / 哈希',
};

export const tools: ToolDef[] = [
  {
    id: 'json-format',
    path: '/json-format',
    name: 'JSON 格式化',
    desc: '格式化、压缩、校验 JSON',
    category: 'encode',
    keywords: ['json', 'format', '格式化', '压缩', ' beautify'],
  },
  {
    id: 'json-diff',
    path: '/json-diff',
    name: 'JSON 对比',
    desc: '左右对比两段 JSON 差异',
    category: 'encode',
    keywords: ['json', 'diff', '对比', '比较'],
  },
  {
    id: 'base64',
    path: '/base64',
    name: 'Base64',
    desc: '文本与 Base64（64 个可打印字符的编码）互转',
    category: 'encode',
    keywords: ['base64', 'b64', '编码'],
  },
  {
    id: 'url',
    path: '/url',
    name: 'URL 编解码',
    desc: '网址特殊字符转 %XX 编码与还原',
    category: 'encode',
    keywords: ['url', 'uri', 'encode', 'percent'],
  },
  {
    id: 'html-entity',
    path: '/html-entity',
    name: 'HTML 实体',
    desc: 'HTML 实体字符编解码',
    category: 'encode',
    keywords: ['html', 'entity', '实体', 'escape'],
  },
  {
    id: 'radix',
    path: '/radix',
    name: '进制转换',
    desc: '2 / 8 / 10 / 16 进制互转',
    category: 'encode',
    keywords: ['radix', 'hex', 'bin', '进制', 'hexadecimal'],
  },
  {
    id: 'jwt',
    path: '/jwt',
    name: 'JWT 解析',
    desc: '解码 JWT 令牌的头部与载荷，查看过期时间',
    category: 'encode',
    keywords: ['jwt', 'token', 'json web token'],
  },
  {
    id: 'timestamp',
    path: '/timestamp',
    name: '时间戳',
    desc: 'Unix 时间戳与日期互转',
    category: 'time',
    keywords: ['timestamp', 'unix', '时间戳', '日期', 'date'],
  },
  {
    id: 'regex',
    path: '/regex',
    name: '正则测试',
    desc: '正则表达式实时匹配、高亮、替换',
    category: 'text',
    keywords: ['regex', 'regexp', '正则', 'match'],
  },
  {
    id: 'text-diff',
    path: '/text-diff',
    name: '文本 Diff',
    desc: '行级文本差异对比',
    category: 'text',
    keywords: ['diff', 'compare', '对比', '差异'],
  },
  {
    id: 'text-stat',
    path: '/text-stat',
    name: '文本统计',
    desc: '字数、行数、字符构成统计',
    category: 'text',
    keywords: ['count', 'stat', '字数', '统计'],
  },
  {
    id: 'case',
    path: '/case',
    name: '命名转换',
    desc: '小驼峰 / 大驼峰 / 下划线 / 中划线等命名互转',
    category: 'text',
    keywords: ['case', 'camel', 'snake', '命名', '转换'],
  },
  {
    id: 'hash',
    path: '/hash',
    name: '哈希计算',
    desc: 'SHA 系列摘要算法，计算文本或文件的哈希值',
    category: 'gen',
    keywords: ['hash', 'sha', 'sha256', '摘要'],
  },
  {
    id: 'uuid',
    path: '/uuid',
    name: 'UUID 生成',
    desc: '批量生成随机唯一标识符',
    category: 'gen',
    keywords: ['uuid', 'guid', 'v4', '随机'],
  },
  {
    id: 'password',
    path: '/password',
    name: '密码生成',
    desc: '可配置字符集的随机密码 / 密钥',
    category: 'gen',
    keywords: ['password', 'secret', '密码', '密钥'],
  },
  {
    id: 'unit',
    path: '/unit',
    name: '单位换算',
    desc: '长度 / 重量 / 温度 / 面积等常用单位互转',
    category: 'encode',
    keywords: ['unit', '单位', '换算', 'convert', 'length', 'weight', '温度', '长度'],
  },
  {
    id: 'yaml',
    path: '/yaml',
    name: 'YAML ⇄ JSON',
    desc: '配置文件 YAML 与 JSON 数据互转',
    category: 'encode',
    keywords: ['yaml', 'yml', 'json', '转换'],
  },
  {
    id: 'csv',
    path: '/csv',
    name: 'CSV ⇄ JSON',
    desc: 'CSV 表格文件与 JSON 数据互转',
    category: 'encode',
    keywords: ['csv', 'excel', '表格', '逗号', '转换'],
  },
  {
    id: 'date',
    path: '/date',
    name: '日期计算',
    desc: '日期差、周几、加减天数、倒数日',
    category: 'time',
    keywords: ['date', '日期', '相差', '倒数', 'delta', '计算'],
  },
  {
    id: 'md',
    path: '/md',
    name: 'Markdown 预览',
    desc: 'Markdown 轻量标记语言实时渲染为网页',
    category: 'text',
    keywords: ['markdown', 'md', '预览', 'preview', '渲染'],
  },
  {
    id: 'qr',
    path: '/qr',
    name: '二维码生成',
    desc: '文本 / 链接生成二维码图片，完全本地',
    category: 'gen',
    keywords: ['qr', '二维码', 'qrcode', '扫码'],
  },
  {
    id: 'random',
    path: '/random',
    name: '随机决策',
    desc: '从选项列表中随机抽取，公平决策',
    category: 'gen',
    keywords: ['random', '随机', '决策', '抽签', 'choice', 'picker', '选择'],
  },
  {
    id: 'color',
    path: '/color',
    name: '颜色工具',
    desc: '颜色十六进制 / RGB / HSL 互转与对比度检查',
    category: 'gen',
    keywords: ['color', 'colour', '颜色', 'hex', 'rgb', 'hsl', '色'],
  },
];

export function searchTools(query: string): ToolDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((t) => {
    const hay = [t.name, t.desc, t.id, ...t.keywords].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
