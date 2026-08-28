import type { InteractionState } from '../systems/InteractionState';
import { i18n } from '../i18n';
import { el } from './dom';

/** Full-screen loading overlay with progress bar. */
export class LoadingOverlay {
  private root: HTMLElement;
  private label: HTMLElement;
  private bar: HTMLElement;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'loading-overlay');
    const title = el('div', '', i18n.t('loadingTitle', state.getLocale()));
    const barWrap = el('div', 'bar');
    this.bar = el('span');
    barWrap.appendChild(this.bar);
    this.label = el('div', '', '0%');
    this.root.append(title, barWrap, this.label);
    uiRoot.appendChild(this.root);

    state.subscribe('locale', () => {
      title.textContent = i18n.t('loadingTitle', state.getLocale());
    });

    state.subscribe('loading', (s) => {
      this.root.style.display = s.loading ? 'flex' : 'none';
      if (!s.loading) {
        this.setProgress(1);
      }
    });
  }

  setProgress(ratio: number): void {
    const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
    this.bar.style.width = `${pct}%`;
    this.label.textContent = `${pct}%`;
  }

  dispose(): void {
    this.root.remove();
  }
}
