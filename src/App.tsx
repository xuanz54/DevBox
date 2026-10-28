import { useEffect, useMemo, useState } from 'react';
import { os } from '@neutralinojs/lib';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
  categoryLabels,
  searchTools,
  tools,
  type ToolCategory,
  type ToolDef,
} from './tools/registry';
import { toolComponents } from './tools/components';
import { useThemeStore } from './stores/theme';
import Settings from './pages/Settings';
import logo from './icons/logo.png';

const categoryOrder: ToolCategory[] = ['encode', 'time', 'text', 'gen'];

const toolIcons: Record<string, string> = {
  'json-format': '{}',
  'json-diff': '⇄',
  base64: '64',
  url: '%',
  'html-entity': '&',
  radix: '10',
  jwt: 'JWT',
  unit: '㎜',
  exchange: '¥',
  yaml: 'Y',
  csv: 'C',
  timestamp: 'TS',
  date: '日',
  regex: '.*',
  'text-diff': '±',
  'text-stat': '#',
  case: 'Aa',
  md: 'M',
  hash: '#',
  uuid: 'id',
  password: '∗',
  qr: '▦',
  random: '◎',
  color: '◐',
};

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="panel px-5 py-3 text-2xl">🚧</div>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="max-w-md text-sm" style={{ color: 'var(--muted)' }}>
        {desc}
      </p>
    </div>
  );
}

function Home({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const [cat, setCat] = useState<ToolCategory | 'all'>('all');
  const filtered = useMemo(() => searchTools(query), [query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: filtered.length };
    for (const c of categoryOrder) {
      map[c] = filtered.filter((t) => t.category === c).length;
    }
    return map;
  }, [filtered]);

  const groups = categoryOrder
    .filter((c) => cat === 'all' || c === cat)
    .map((c) => ({ cat: c, items: filtered.filter((t) => t.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="home-scroll">
      <div className="home-inner">
        <h1 className="home-title">今天想动哪个工具？</h1>
        <p className="home-sub">
          全部在本机运行，不上传、不联网（汇率刷新除外）。
        </p>

        <label className="search-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.6 10.6 14 14" />
          </svg>
          <input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜工具，比如 json、时间、哈希"
            autoComplete="off"
            spellCheck={false}
            aria-label="搜索工具"
          />
          <span className="search-kbd">CTRL K</span>
        </label>

        <div className="chips" role="group" aria-label="工具分类">
          {([['all', '全部'], ...categoryOrder.map((c) => [c, categoryLabels[c]])] as [
            ToolCategory | 'all',
            string,
          ][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              data-cat={key}
              aria-pressed={cat === key}
              className="chip"
              onClick={() => setCat(key)}
            >
              {label}
              <span className="chip-count">{counts[key] ?? 0}</span>
            </button>
          ))}
        </div>

        {groups.map(({ cat: c, items }) => (
          <section key={c} className="grp" data-cat={c}>
            <h2 className="grp-head">
              <span className="grp-dot" aria-hidden="true" />
              {categoryLabels[c]}
              <span className="grp-count">{items.length}</span>
            </h2>
            <div className="tool-grid">
              {items.map((t) => {
                const icon = toolIcons[t.id] ?? t.name.slice(0, 1);
                return (
                  <Link key={t.id} to={t.path} className="tool-card">
                    <span
                      className={`tool-ic${icon.length > 2 ? ' is-wide' : ''}`}
                      data-cat={t.category}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span className="tool-meta">
                      <span className="tool-name">{t.name}</span>
                      <span className="tool-desc">{t.desc}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {groups.length === 0 ? (
          <div className="home-empty">
            没有匹配的工具 — 试试「json」「哈希」，或者清空搜索。
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ToolRoutes({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <Routes>
      <Route path="/" element={<Home query={query} setQuery={setQuery} />} />
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
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Home query={query} setQuery={setQuery} />} />
    </Routes>
  );
}

function ThemeToggle() {
  const resolved = useThemeStore((s) => s.resolved);
  const toggle = useThemeStore((s) => s.toggle);
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? '切换到浅色' : '切换到深色'}
      aria-label="切换主题"
      className="icon-btn"
    >
      {dark ? (
        <svg
          width="17"
          height="17"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.4 4.4l1.4 1.4M14.2 14.2l1.4 1.4M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4" />
        </svg>
      ) : (
        <svg
          width="17"
          height="17"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const el = document.getElementById('home-search') as HTMLInputElement | null;
            el?.focus();
            el?.select();
          });
        });
      }
      if (e.key === 'Escape' && query) {
        setQuery('');
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query, navigate]);

  useEffect(() => {
    const openExternal = (e: MouseEvent) => {
      if (e.type === 'click' && e.button !== 0) return;
      if (e.type === 'auxclick' && e.button !== 1) return;
      const anchor = (e.target as Element | null)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !/^(https?:|mailto:)/i.test(href)) return;
      e.preventDefault();
      if (typeof window.NL_APPID === 'string') {
        void os.open(href).catch(() => {});
      } else {
        window.open(href, '_blank');
      }
    };
    window.addEventListener('click', openExternal, true);
    window.addEventListener('auxclick', openExternal, true);
    return () => {
      window.removeEventListener('click', openExternal, true);
      window.removeEventListener('auxclick', openExternal, true);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <img src={logo} alt="" className="app-logo" />
        <span className="app-name">DevBox</span>
        <span className="app-chip">{tools.length} 个工具</span>
        <div className="topbar-right">
          <ThemeToggle />
          <Link to="/settings" className="icon-btn" title="设置" aria-label="设置">
            <svg
              width="17"
              height="17"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 5.5h4.2M10.8 5.5H17M3 10h6.2M12.8 10H17M3 14.5h2.2M8.8 14.5H17" />
              <circle cx="9" cy="5.5" r="1.7" />
              <circle cx="11" cy="10" r="1.7" />
              <circle cx="7" cy="14.5" r="1.7" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="app-main">
        <ToolRoutes query={query} setQuery={setQuery} />
      </main>
    </div>
  );
}
