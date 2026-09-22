import { useCallback, useState, type ReactNode } from 'react';
import { clipboard, filesystem, os } from '@neutralinojs/lib';

function isNative(): boolean {
  return typeof window.NL_APPID === 'string';
}

export async function copyText(text: string): Promise<boolean> {
  if (isNative()) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function pickTextFile(): Promise<{ name: string; content: string } | null> {
  if (isNative()) {
    try {
      const result = (await os.showOpenDialog('打开文本文件', {
        filters: [
          { name: 'Text / JSON', extensions: ['txt', 'json', 'md', 'csv', 'log'] },
          { name: 'All files', extensions: ['*'] },
        ],
      })) as { filePaths?: string[]; filePath?: string } | string[];
      const path = Array.isArray(result)
        ? result[0]
        : (result.filePaths?.[0] ?? result.filePath);
      if (!path) return null;
      const content = await filesystem.readFile(path);
      return { name: path.split(/[\\/]/).pop() ?? path, content };
    } catch (e) {
      console.error('pickTextFile native failed', e);
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      void file.text().then((content) => resolve({ name: file.name, content }));
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function saveTextFile(suggestedName: string, content: string): Promise<boolean> {
  if (isNative()) {
    try {
      const result = (await os.showSaveDialog('保存文件', {
        defaultPath: suggestedName,
        filters: [{ name: 'Text', extensions: ['txt', 'json', 'md'] }],
      })) as { filePath?: string } | string | null;
      const path = typeof result === 'string' ? result : result?.filePath;
      if (!path) return false;
      await filesystem.writeFile(path, content);
      return true;
    } catch (e) {
      console.error('saveTextFile native failed', e);
    }
  }
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const onClick = useCallback(() => {
    void copyText(text).then((success) => {
      setState(success ? 'ok' : 'fail');
      window.setTimeout(() => setState('idle'), 1200);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!text}
      className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs hover:border-indigo-400 disabled:opacity-40 dark:border-white/10 dark:bg-white/5"
    >
      {state === 'ok' ? '已复制' : state === 'fail' ? '失败' : label}
    </button>
  );
}

export function ToolPage({
  title,
  desc,
  actions,
  children,
}: {
  title: string;
  desc: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-4 dark:border-white/10">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-xs opacity-60">{desc}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
      {message}
    </div>
  );
}

export function Pane({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide opacity-50 dark:border-white/10">
        <span>{label}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  readOnly = false,
  placeholder,
  mono = true,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      spellCheck={false}
      className={`h-full min-h-40 w-full flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none ${
        mono ? 'font-mono' : ''
      }`}
    />
  );
}

export function btn(primary = false): string {
  return [
    'rounded-md px-2.5 py-1 text-xs border transition',
    primary
      ? 'border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600'
      : 'border-black/10 bg-white hover:border-indigo-400 dark:border-white/10 dark:bg-white/5',
  ].join(' ');
}
