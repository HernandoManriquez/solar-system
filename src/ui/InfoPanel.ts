import type { InteractionState } from '../systems/InteractionState';
import { getBody } from '../data/solarSystem';
import { i18n } from '../i18n';
import { el } from './dom';

/**
 * Overview edge panel showing a summary of the currently hovered body
 * (hidden in detail mode). Complements the lightweight tooltip.
 */
export class InfoPanel {
  private root: HTMLElement;
  private title: HTMLElement;
  private meta: HTMLElement;
  private desc: HTMLElement;
  private fun: HTMLElement;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'info-panel');
    this.title = el('h2');
    this.meta = el('div', 'meta');
    this.desc = el('p');
    this.fun = el('div', 'fun');
    this.root.append(this.title, this.meta, this.desc, this.fun);
    this.root.style.display = 'none';
    uiRoot.appendChild(this.root);

    const render = (): void => {
      const s = state.current;
      if (s.mode !== 'overview') {
        this.root.style.display = 'none';
        return;
      }
      const body = getBody(s.hoveredId);
      if (!body) {
        this.root.style.display = 'none';
        return;
      }
      this.title.textContent = i18n.name(body, s.locale);
      const kind =
        body.type === 'planet'
          ? i18n.t('kindPlanet', s.locale)
          : body.type === 'sun'
            ? i18n.t('kindStar', s.locale)
            : i18n.t('kindMoon', s.locale);
      const moons = i18n.format(i18n.t('moonsCount', s.locale), {
        n: body.confirmedMoons ?? body.moons.length,
      });
      this.meta.textContent =
        `${kind} · ${moons}` + (body.hasRings ? ` · ${i18n.t('rings', s.locale)}` : '');
      this.desc.textContent = i18n.description(body, s.locale);
      const fun = i18n.funFact(body, s.locale);
      if (fun) {
        this.fun.textContent = fun;
        this.fun.style.display = '';
      } else {
        this.fun.style.display = 'none';
      }
      this.root.style.display = 'block';
    };

    state.subscribe('hover', render);
    state.subscribe('locale', render);
    state.subscribe('change', render);
  }

  dispose(): void {
    this.root.remove();
  }
}
