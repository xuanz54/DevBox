import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { init } from '@neutralinojs/lib';
import App from './App';
import './styles.css';

const isNative =
  typeof window.NL_APPID === 'string' || typeof window.Neutralino !== 'undefined';

if (isNative) {
  try {
    init();
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
