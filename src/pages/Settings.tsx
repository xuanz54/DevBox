import type { ReactNode } from 'react';
import { CopyButton, Pane, ToolPage } from '../components/ui';
import { useThemeStore, type Theme } from '../stores/theme';
import pkg from '../../package.json';

const REPO_URL = 'https://github.com/xuanz54/DevBox';

const THEME_OPTIONS: { value: Theme; label: string; desc: string }[] = [
  { value: 'system', label: '跟随系统', desc: '随操作系统的深浅色设置自动切换' },
  { value: 'light', label: '浅色', desc: '始终使用浅色界面' },
  { value: 'dark', label: '深色', desc: '始终使用深色界面' },
];

function isNative(): boolean {
  return typeof window.NL_APPID === 'string';
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 opacity-60">{label}</span>
      <span className="min-w-0 truncate text-right">{children}</span>
    </div>
  );
}

export default function Settings() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const native = isNative();
  const version = native ? window.NL_APPVERSION : pkg.version;

  return (
    <ToolPage title="设置" desc="外观与关于信息">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Pane label="外观">
          <div className="p-4">
            <div className="text-sm font-medium">主题</div>
            <p className="mt-0.5 text-xs opacity-60">
              「跟随系统」会随操作系统的深浅色设置自动切换；右上角按钮可快速切换浅色 / 深色
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setTheme(o.value)}
                  title={o.desc}
                  className={
                    theme === o.value
                      ? 'rounded-lg border border-indigo-500 bg-indigo-500/15 px-3 py-1.5 text-sm font-medium text-indigo-600 transition dark:text-indigo-300'
                      : 'rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm transition hover:border-indigo-400 dark:border-white/10 dark:bg-white/5'
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </Pane>

        <Pane label="关于">
          <div className="p-4">
            <InfoRow label="应用版本">{version}</InfoRow>
            <InfoRow label="GitHub 仓库">
              <span className="inline-flex min-w-0 items-center gap-2">
                <a
                  href={REPO_URL}
                  className="truncate text-indigo-600 underline underline-offset-2 hover:opacity-80 dark:text-indigo-300"
                >
                  github.com/xuanz54/DevBox
                </a>
                <CopyButton text={REPO_URL} label="复制" />
              </span>
            </InfoRow>
            <InfoRow label="运行环境">
              {native ? '原生应用' : '浏览器开发模式'}
            </InfoRow>
            {native && <InfoRow label="系统">{window.NL_OS}</InfoRow>}
            {native && <InfoRow label="框架版本">{window.NL_VERSION}</InfoRow>}
            <p className="mt-3 border-t border-black/10 pt-3 text-xs opacity-60 dark:border-white/10">
              DevBox · 本地优先的开发者工具箱，所有数据在本地处理，无需联网。
            </p>
          </div>
        </Pane>
      </div>
    </ToolPage>
  );
}
