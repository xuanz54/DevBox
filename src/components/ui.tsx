import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
        filters: [{ name: 'Text / Data', extensions: ['txt', 'json', 'md', 'csv', 'yaml', 'yml', 'svg', 'html', 'log'] }],
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

export async function saveImageFile(
  suggestedName: string,
  dataUrl: string,
): Promise<boolean> {
  if (isNative()) {
    try {
      const result = (await os.showSaveDialog('保存图片', {
        defaultPath: suggestedName,
        filters: [{ name: 'Image / Web', extensions: ['png', 'svg'] }],
      })) as { filePath?: string } | string | null;
      const path = typeof result === 'string' ? result : result?.filePath;
      if (!path) return false;
      const meta = /^data:[^;]+;base64,(.+)$/.exec(dataUrl);
      if (meta?.[1]) {
        const bin = atob(meta[1]);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        await filesystem.writeBinaryFile(path, bytes.buffer);
      } else {
        await filesystem.writeFile(path, dataUrl);
      }
      return true;
    } catch (e) {
      console.error('saveImageFile native failed', e);
    }
  }
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = suggestedName;
    a.click();
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
      className="btn btn-sm"
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
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="tool-page">
      <header className="tool-head">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/')}
          title="返回首页 (Esc)"
          aria-label="返回首页"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.5 3.5 5 8l4.5 4.5" />
          </svg>
        </button>
        <div className="tool-heading">
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        {actions ? <div className="tool-actions">{actions}</div> : null}
      </header>
      <div className="tool-body">{children}</div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <div className="notice notice-error">{message}</div>;
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
    <div className={`pane ${className}`}>
      <div className="pane-head">
        <span>{label}</span>
      </div>
      <div className="pane-body">{children}</div>
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
      style={{ color: 'var(--ink)' }}
    />
  );
}

export function btn(primary = false): string {
  return primary ? 'btn btn-primary' : 'btn';
}
