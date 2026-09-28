import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'devbox.theme.v2';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return 'light';
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolved: ResolvedTheme =
    theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  return resolved;
}

interface ThemeState {
  theme: Theme;
  resolved: ResolvedTheme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const initialTheme = readTheme();
const initialResolved = applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolved: initialResolved,
  toggle: () => {
    get().setTheme(get().resolved === 'dark' ? 'light' : 'dark');
  },
  setTheme: (t) => {
    const resolved = applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    set({ theme: t, resolved });
  },
}));

media.addEventListener('change', () => {
  if (useThemeStore.getState().theme === 'system') {
    useThemeStore.setState({ resolved: applyTheme('system') });
  }
});
