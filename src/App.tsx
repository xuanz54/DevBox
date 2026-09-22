import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import {
  categoryLabels,
  searchTools,
  tools,
  type ToolCategory,
  type ToolDef,
} from './tools/registry';
import { toolComponents } from './tools/components';
import { useThemeStore } from './stores/theme';

const categoryOrder: ToolCategory[] = ['encode', 'time', 'text', 'gen', 'net'];

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="rounded-2xl bg-indigo-500/10 px-4 py-2 text-3xl">🚧</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-sm opacity-60">{desc}</p>
    </div>
  );
}

function Home() {
  return (
    <div className="h-full overflow-auto p-8">
      <h1 className="text-2xl font-bold tracking-tight">DevBox</h1>
      <p className="mt-1 text-sm opacity-60">
        本地优先的开发者工具箱 · 共 {tools.length} 个工具
      </p>
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {tools.map((t) => (
          <NavLink
            key={t.id}
            to={t.path}
            className="rounded-xl border border-black/10 bg-white/70 p-4 transition hover:border-indigo-400/60 hover:shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <div className="font-medium">{t.name}</div>
            <div className="mt-1 text-xs opacity-60">{t.desc}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function ToolRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {tools.map((t: ToolDef) => {
        const Comp = toolComponents[t.id];
        return (
          <Route
            key={t.id}
            path={t.path}
            element={Comp ? <Comp /> : <Placeholder title={t.name} desc={t.desc} />}
          />
        );
      })}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

function Sidebar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const filtered = searchTools(query);
  const grouped = categoryOrder
    .map((cat) => ({ cat, items: filtered.filter((t) => t.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-black/10 bg-white/60 dark:border-white/10 dark:bg-black/20">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          D
        </div>
        <div>
          <div className="text-sm font-semibold leading-none">DevBox</div>
          <div className="mt-0.5 text-[10px] opacity-50">Developer Toolbox</div>
        </div>
      </div>
      <div className="px-3 pb-2">
        <input
          id="tool-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索工具… (Ctrl+K)"
          className="w-full rounded-lg border border-black/10 bg-black/5 px-3 py-1.5 text-sm outline-none placeholder:opacity-40 focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `mb-1 block rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                : 'opacity-70 hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          首页
        </NavLink>
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="mt-3">
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide opacity-40">
              {categoryLabels[cat]}
            </div>
            {items.map((t) => (
              <NavLink
                key={t.id}
                to={t.path}
                className={({ isActive }) =>
                  `mb-0.5 block rounded-lg px-3 py-1.5 text-sm transition ${
                    isActive
                      ? 'bg-indigo-500/15 font-medium text-indigo-600 dark:text-indigo-300'
                      : 'opacity-70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`
                }
              >
                {t.name}
              </NavLink>
            ))}
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="px-3 py-6 text-center text-xs opacity-40">无匹配工具</div>
        )}
      </nav>
    </aside>
  );
}

function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={toggle}
      title="切换主题"
      className="rounded-lg border border-black/10 bg-white/70 px-2.5 py-1 text-xs opacity-70 hover:opacity-100 dark:border-white/10 dark:bg-white/10"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export default function App() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('tool-search')?.focus();
      }
      if (e.key === 'Escape' && query) {
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query]);

  return (
    <div className="flex h-full">
      <Sidebar query={query} setQuery={setQuery} />
      <main className="relative min-w-0 flex-1 bg-[#f4f5f7] dark:bg-[#0c0d10]">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="h-full pt-10">
          <ToolRoutes />
        </div>
      </main>
    </div>
  );
}
