import type { InteractionState } from '../systems/InteractionState';
import { i18n } from '../i18n';
import { el } from './dom';

/** "Back to Solar System" control shown in detail view. */
export class ReturnButton {
  private button: HTMLElement;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.button = el('button', 'return-btn');
    this.button.style.display = 'none';
    this.button.addEventListener('click', () => state.clearSelection());
    uiRoot.appendChild(this.button);

    const render = (s: typeof state.current): void => {
      this.button.textContent = i18n.t('returnToSystem', s.locale);
      this.button.style.display = s.mode === 'detail' ? 'block' : 'none';
    };

    state.subscribe('change', render);
    state.subscribe('locale', render);
  }

  dispose(): void {
    this.button.remove();
  }
}
