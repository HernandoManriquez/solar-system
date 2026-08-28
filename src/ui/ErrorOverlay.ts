import type { InteractionState } from '../systems/InteractionState';
import type { Locale } from '../systems/InteractionState';
import { i18n } from '../i18n';
import { el } from './dom';

/** Full-screen error overlay with a retry action. */
export class ErrorOverlay {
  private root: HTMLElement;
  private onRetry: (() => void) | null = null;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'error-overlay');
    this.root.style.display = 'none';
    uiRoot.appendChild(this.root);

    state.subscribe('error', (s) => {
      if (s.error) {
        this.show(s.error, s.locale);
      } else {
        this.root.style.display = 'none';
      }
    });
  }

  private show(message: string, locale: Locale): void {
    clearChildren(this.root);
    const title = el('h2', '', i18n.t('errorTitle', locale));
    const p = el('p', '', message);
    const retry = el('button', '', i18n.t('errorRetry', locale));
    retry.addEventListener('click', () => this.onRetry?.());
    this.root.append(title, p, retry);
    this.root.style.display = 'flex';
  }

  setRetryHandler(handler: () => void): void {
    this.onRetry = handler;
  }

  dispose(): void {
    this.root.remove();
  }
}

function clearChildren(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
