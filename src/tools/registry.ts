export type ToolCategory = 'encode' | 'time' | 'text' | 'gen' | 'net';

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
  net: '网络',
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
    desc: '文本与 Base64 互转（UTF-8）',
    category: 'encode',
    keywords: ['base64', 'b64', '编码'],
  },
  {
    id: 'url',
    path: '/url',
    name: 'URL 编解码',
    desc: 'encodeURIComponent / decodeURIComponent',
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
    desc: '解码 Header / Payload，查看过期时间',
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
    desc: '实时匹配、高亮、替换',
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
    desc: 'camel / snake / kebab / Pascal 互转',
    category: 'text',
    keywords: ['case', 'camel', 'snake', '命名', '转换'],
  },
  {
    id: 'hash',
    path: '/hash',
    name: '哈希计算',
    desc: 'SHA-1 / SHA-256 / SHA-512',
    category: 'gen',
    keywords: ['hash', 'sha', 'sha256', '摘要'],
  },
  {
    id: 'uuid',
    path: '/uuid',
    name: 'UUID 生成',
    desc: '批量生成 UUID v4',
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
    id: 'http',
    path: '/http',
    name: 'HTTP 请求',
    desc: '发送请求，查看状态与耗时',
    category: 'net',
    keywords: ['http', 'request', 'api', '请求', '接口'],
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
