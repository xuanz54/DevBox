import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'devbox.theme.v2';

function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    /* ignore */
  }
  return 'light';
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readTheme(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  setTheme: (t) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    set({ theme: t });
  },
}));

document.documentElement.classList.toggle('dark', readTheme() === 'dark');
