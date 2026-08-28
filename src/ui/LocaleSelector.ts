import type { InteractionState, Locale } from '../systems/InteractionState';
import { el } from './dom';

/**
 * Corner language selector (top-right, tucks under the info panel) for switching
 * between English and Spanish. Persists the choice to localStorage.
 */
export class LocaleSelector {
  private root: HTMLElement;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'locale-selector');
    const label = el('span', '', '🌐');
    const select = el('select');
    select.append(this.option('en', 'English'), this.option('es', 'Español'));
    select.value = state.getLocale();
    select.addEventListener('change', () => {
      const loc = select.value as Locale;
      state.setLocale(loc);
      try {
        localStorage.setItem('solar-system-locale', loc);
      } catch {
        /* storage may be unavailable; ignore */
      }
    });
    state.subscribe('locale', (s) => {
      select.value = s.locale;
    });
    this.root.append(label, select);
    uiRoot.appendChild(this.root);
  }

  private option(value: string, text: string): HTMLOptionElement {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    return o;
  }

  dispose(): void {
    this.root.remove();
  }
}
