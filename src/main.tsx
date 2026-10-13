import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { init, window as nw } from '@neutralinojs/lib';
import App from './App';
import './styles.css';

const isNative =
  typeof window.NL_APPID === 'string' || typeof window.Neutralino !== 'undefined';

async function ensureWindowOnScreen(): Promise<void> {
  try {
    const pos = await nw.getPosition();
    if (pos.x == null || pos.y == null) return;
    const availW = window.screen.availWidth || window.screen.width;
    const availH = window.screen.availHeight || window.screen.height;
    const margin = 80;
    const offscreen =
      pos.x < -margin ||
      pos.y < -margin ||
      pos.x > availW - margin ||
      pos.y > availH - margin;
    if (offscreen) {
      await nw.center();
    }
  } catch {
    // best effort, never block startup
  }
}

if (isNative) {
  try {
    init();
    void ensureWindowOnScreen();
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
