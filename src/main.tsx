import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { init, window as nw, filesystem } from '@neutralinojs/lib';
import App from './App';
import './styles.css';

const isNative =
  typeof window.NL_APPID === 'string' || typeof window.Neutralino !== 'undefined';

const WINDOW_FIT_MARKER = '.devbox-window-fit';

function fitMarkerPath(): string | null {
  try {
    const dataPath = window.NL_DATAPATH;
    if (dataPath) return `${dataPath}/${WINDOW_FIT_MARKER}`;
    const appPath = window.NL_PATH;
    if (appPath) return `${appPath}/${WINDOW_FIT_MARKER}`;
  } catch {
    /* ignore */
  }
  return null;
}

async function hasFittedBefore(): Promise<boolean> {
  const marker = fitMarkerPath();
  if (marker) {
    try {
      await filesystem.getStats(marker);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    return localStorage.getItem(WINDOW_FIT_MARKER) === '1';
  } catch {
    return false;
  }
}

async function rememberFitted(): Promise<void> {
  const marker = fitMarkerPath();
  if (marker) {
    try {
      await filesystem.writeFile(marker, '1');
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.setItem(WINDOW_FIT_MARKER, '1');
  } catch {
    /* ignore */
  }
}

async function fitWindowToScreen(): Promise<void> {
  try {
    const dpr = window.devicePixelRatio || 1;
    const availW = window.screen.availWidth || window.screen.width;
    const availH = window.screen.availHeight || window.screen.height;
    if (!availW || !availH) return;

    if (!(await hasFittedBefore())) {
      // 首次启动：开到屏幕的 94%×92%（上限 1400×900 DIP），之后沿用系统记住的窗口尺寸。
      const width = Math.round(Math.min(Math.floor(availW * 0.94), 1400) * dpr);
      const height = Math.round(Math.min(Math.floor(availH * 0.92), 900) * dpr);
      await nw.setSize({ width, height });
      await nw.center();
      await rememberFitted();
      return;
    }

    const pos = await nw.getPosition();
    if (pos.x == null || pos.y == null) return;
    const x = pos.x / dpr;
    const y = pos.y / dpr;
    const margin = 80;
    if (x < -margin || y < -margin || x > availW - margin || y > availH - margin) {
      await nw.center();
    }
  } catch {
    // best effort, never block startup
  }
}

if (isNative) {
  try {
    init();
    void fitWindowToScreen();
  } catch (err) {
    console.error('Neutralino init failed', err);
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root');
}

createRoot(rootEl).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
