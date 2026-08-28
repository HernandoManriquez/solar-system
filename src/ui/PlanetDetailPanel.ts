import type { InteractionState } from '../systems/InteractionState';
import { getBody, getMoonsOf } from '../data/solarSystem';
import { i18n } from '../i18n';
import { clear, el, fmtKm } from './dom';

/**
 * Full detail panel shown in the planet-detail view with planetary stats,
 * atmosphere, moons, rings, description and fun fact.
 */
export class PlanetDetailPanel {
  private root: HTMLElement;
  private title: HTMLElement;
  private meta: HTMLElement;
  private stats: HTMLDListElement;
  private desc: HTMLElement;
  private fun: HTMLElement;

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'detail-panel');
    this.title = el('h2');
    this.meta = el('div', 'meta');
    this.stats = el('dl', 'stats');
    this.desc = el('p');
    this.fun = el('div', 'fun');
    this.root.append(this.title, this.meta, this.stats, this.desc, this.fun);
    this.root.style.display = 'none';
    uiRoot.appendChild(this.root);

    const render = (): void => {
      const s = state.current;
      if (s.mode !== 'detail') {
        this.root.style.display = 'none';
        return;
      }
      const body = getBody(s.selectedId);
      if (!body) {
        this.root.style.display = 'none';
        return;
      }
      this.title.textContent = i18n.name(body, s.locale);
      if (body.type === 'sun') {
        this.meta.textContent = i18n.t('starMeta', s.locale);
      } else {
        const kind =
          body.type === 'planet'
            ? i18n.t('kindPlanet', s.locale)
            : i18n.t('kindMoon', s.locale);
        const atm = body.atmosphere.present
          ? i18n.t('atmospherePresent', s.locale)
          : i18n.t('noAtmosphere', s.locale);
        this.meta.textContent = `${kind} · ${atm}`;
      }

      clear(this.stats);
      this.addStat(i18n.t('statRadius', s.locale), fmtKm(body.radiusKm, s.locale));
      if (body.orbitalDistanceKm > 0) {
        this.addStat(i18n.t('statOrbitalDistance', s.locale), fmtKm(body.orbitalDistanceKm, s.locale));
      }
      if (body.orbitalPeriodDays > 0) {
        this.addStat(
          i18n.t('statOrbitalPeriod', s.locale),
          `${body.orbitalPeriodDays.toFixed(1)} ${i18n.t('days', s.locale)}`,
        );
      }
      if (body.rotationPeriodHours > 0) {
        const hrs = body.rotationPeriodHours;
        const value =
          hrs < 30
            ? `${hrs.toFixed(1)} ${i18n.t('hours', s.locale)}`
            : `${(hrs / 24).toFixed(1)} ${i18n.t('days', s.locale)}`;
        this.addStat(i18n.t('statRotationPeriod', s.locale), value);
      }
      if (body.hasRings) this.addStat(i18n.t('statRings', s.locale), i18n.t('yes', s.locale));
      const moons = getMoonsOf(body.id);
      if (moons.length) {
        const names = moons.map((m) => i18n.name(m, s.locale)).join(', ');
        this.addStat(i18n.t('statMoons', s.locale), `${moons.length} (${names})`);
      } else {
        this.addStat(i18n.t('statMoons', s.locale), i18n.t('noneShown', s.locale));
      }
      if (body.atmosphere.present) {
        this.addStat(i18n.t('statAtmosphere', s.locale), i18n.atmosphere(body, s.locale));
      }

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

    state.subscribe('select', render);
    state.subscribe('locale', render);
    state.subscribe('change', render);
  }

  private addStat(label: string, value: string): void {
    const dt = el('dt');
    dt.textContent = label;
    const dd = el('dd');
    dd.textContent = value;
    this.stats.append(dt, dd);
  }

  dispose(): void {
    this.root.remove();
  }
}
