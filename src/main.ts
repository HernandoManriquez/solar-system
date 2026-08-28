import './styles/main.css';
import { App } from './core/App';
import { i18n } from './i18n';
import type { Locale } from './i18n';

const appEl = document.getElementById('app');
const uiRoot = document.getElementById('ui-root');

if (!appEl || !uiRoot) {
  throw new Error('Missing #app or #ui-root mount point.');
}

const mount = uiRoot;

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem('solar-system-locale');
    if (stored === 'en' || stored === 'es') return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

const initialLocale = detectLocale();

function showError(message: string, key: 'webglMessage' | 'failedToStart'): void {
  mount.textContent = '';
  const overlay = document.createElement('div');
  overlay.className = 'error-overlay';
  const h = document.createElement('h2');
  h.textContent =
    key === 'webglMessage' ? i18n.t('webglNotSupported', initialLocale) : i18n.t('failedToStart', initialLocale);
  const p = document.createElement('p');
  p.textContent = key === 'webglMessage' ? i18n.t('webglMessage', initialLocale) : message;
  const retry = document.createElement('button');
  retry.textContent = i18n.t('reload', initialLocale);
  retry.addEventListener('click', () => window.location.reload());
  overlay.append(h, p, retry);
  mount.appendChild(overlay);
}

const canvasSupported = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
})();

if (!canvasSupported) {
  showError('', 'webglMessage');
} else {
  const app = new App(appEl, mount);
  const hint = document.createElement('div');
  hint.className = 'overview-hint';
  hint.textContent = i18n.t('overviewHint', initialLocale);
  mount.appendChild(hint);
  void app.start().catch((err) => {
    showError(err instanceof Error ? err.message : String(err), 'failedToStart');
  });
}
