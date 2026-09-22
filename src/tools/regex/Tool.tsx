import { useMemo, useState } from 'react';
import { CopyButton, ErrorBanner, Pane, TextArea, ToolPage, btn } from '../../components/ui';

interface MatchSpan {
  start: number;
  end: number;
  text: string;
}

function safeRegExp(pattern: string, flags: string): ResultLike {
  if (!pattern) return { ok: false, error: '请输入正则' };
  try {
    return { ok: true, re: new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

type ResultLike = { ok: true; re: RegExp } | { ok: false; error: string };

function findAll(re: RegExp, text: string): { spans: MatchSpan[]; groups: string[][] } {
  const spans: MatchSpan[] = [];
  const groups: string[][] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    groups.push(m.slice(1).map((g) => g ?? ''));
    if (m[0].length === 0) {
      re.lastIndex += 1;
      if (re.lastIndex > text.length) break;
    }
  }
  return { spans, groups };
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('contact alice@example.com or bob@test.org');
  const [replacement, setReplacement] = useState('[$&]');

  const compiled = useMemo(() => safeRegExp(pattern, flags), [pattern, flags]);
  const matches = useMemo(() => {
    if (!compiled.ok) return null;
    return findAll(compiled.re, text);
  }, [compiled, text]);

  const replaced = useMemo(() => {
    if (!compiled.ok) return '';
    try {
      const re = new RegExp(pattern, flags.replace('g', '') || '');
      return text.replace(re, replacement);
    } catch {
      return '';
    }
  }, [compiled, pattern, flags, text, replacement]);

  const highlighted = useMemo(() => {
    if (!matches || matches.spans.length === 0) return text;
    const parts: { chunk: string; hit: boolean }[] = [];
    let cursor = 0;
    for (const s of matches.spans) {
      if (s.start > cursor) {
        parts.push({ chunk: text.slice(cursor, s.start), hit: false });
      }
      parts.push({ chunk: text.slice(s.start, s.end), hit: true });
      cursor = s.end;
    }
    if (cursor < text.length) parts.push({ chunk: text.slice(cursor), hit: false });
    return parts;
  }, [matches, text]);

  const snippets = ['\\d+', '[a-z]+', '\\bfoo\\b', '(\\w+)@([\\w.]+)', '^\\s*$', 'a|b'];

  return (
    <ToolPage
      title="正则测试"
      desc="实时匹配、分组查看、替换预览"
      actions={<CopyButton text={replaced} label="复制替换结果" />}
    >
      <ErrorBanner message={compiled.ok ? '' : compiled.error} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm opacity-50">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="min-w-52 flex-1 rounded-md border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <span className="font-mono text-sm opacity-50">/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          className="w-16 rounded-md border border-black/10 bg-white px-2 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <span className="text-xs opacity-60">
          {matches ? `${matches.spans.length} 个匹配` : '—'}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {snippets.map((s) => (
          <button
            key={s}
            type="button"
            className={btn()}
            onClick={() => setPattern(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <Pane label="测试文本（命中高亮）" className="min-h-32">
          <div className="whitespace-pre-wrap break-all px-3 py-2 font-mono text-sm leading-6">
            {Array.isArray(highlighted)
              ? highlighted.map((p, i) =>
                  p.hit ? (
                    <mark key={i} className="rounded bg-indigo-500/30 px-0.5 text-indigo-200">
                      {p.chunk}
                    </mark>
                  ) : (
                    <span key={i}>{p.chunk}</span>
                  ),
                )
              : highlighted}
          </div>
        </Pane>

        {matches && matches.groups.length > 0 ? (
          <Pane label="分组" className="min-h-20">
            <div className="overflow-auto p-2 font-mono text-xs">
              {matches.groups.map((g, i) => (
                <div key={i} className="py-0.5">
                  #{i + 1}: {g.map((x, j) => `[${j + 1}]${x}`).join(' ') || '(无分组)'}
                </div>
              ))}
            </div>
          </Pane>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <Pane label="输入（同步）" className="min-h-32">
            <TextArea value={text} onChange={setText} />
          </Pane>
          <Pane label="替换预览" className="min-h-32">
            <div className="flex flex-col">
              <input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                className="border-b border-black/10 bg-transparent px-3 py-2 font-mono text-sm outline-none dark:border-white/10"
                placeholder="替换为，支持 $1 $&"
              />
              <div className="whitespace-pre-wrap break-all px-3 py-2 font-mono text-sm opacity-80">
                {replaced}
              </div>
            </div>
          </Pane>
        </div>
      </div>
    </ToolPage>
  );
}
