import type { InteractionState } from '../systems/InteractionState';
import { getBody } from '../data/solarSystem';
import { i18n } from '../i18n';
import { el } from './dom';

export class HoverTooltip {
  private root: HTMLElement;
  private nameEl: HTMLElement;
  private descEl: HTMLElement;
  private visible = false;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'tooltip');
    this.nameEl = el('div', 't-name');
    this.descEl = el('div', 't-desc');
    this.root.append(this.nameEl, this.descEl);
    this.root.style.display = 'none';
    uiRoot.appendChild(this.root);

    const render = (s: typeof state.current): void => {
      const body = getBody(s.hoveredId);
      if (!body || !s.hoverScreen) {
        this.hide();
        return;
      }
      this.nameEl.textContent = i18n.name(body, s.locale);
      this.descEl.textContent = i18n.description(body, s.locale);
      this.root.style.display = 'block';
      const offset = 14;
      const x = Math.min(s.hoverScreen.x + offset, window.innerWidth - this.root.offsetWidth - 8);
      const y = Math.min(s.hoverScreen.y + offset, window.innerHeight - this.root.offsetHeight - 8);
      this.root.style.left = `${x}px`;
      this.root.style.top = `${y}px`;
      this.visible = true;
    };

    state.subscribe('hover', render);
    state.subscribe('locale', render);
  }

  private hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.root.style.display = 'none';
  }

  dispose(): void {
    this.root.remove();
  }
}
