import type { InteractionState } from '../systems/InteractionState';
import { i18n } from '../i18n';
import { el } from './dom';

const SPEEDS = [0.5, 1, 2] as const;

/**
 * Bottom-right motion controls: pause button for orbital translation plus a
 * speed selector. Pausing + slowing down make moving targets (e.g. moons)
 * easier to hover and click.
 */
export class MotionControls {
  private root: HTMLElement;
  private pauseBtn: HTMLElement;
  private speedBtns: HTMLElement[] = [];

  constructor(state: InteractionState, uiRoot: HTMLElement) {
    this.root = el('div', 'motion-controls');

    this.pauseBtn = el('button', 'mc-btn mc-pause');
    this.pauseBtn.addEventListener('click', () => state.togglePaused());

    const speedGroup = el('div', 'mc-speed');
    for (const s of SPEEDS) {
      const btn = el('button', 'mc-btn', `${s}×`);
      btn.dataset['speed'] = String(s);
      btn.addEventListener('click', () => state.setSpeed(s));
      this.speedBtns.push(btn);
      speedGroup.appendChild(btn);
    }

    const render = (s: typeof state.current): void => {
      this.pauseBtn.textContent = i18n.t(s.paused ? 'motionResume' : 'motionPause', s.locale);
      this.pauseBtn.classList.toggle('active', s.paused);
      for (const btn of this.speedBtns) {
        btn.classList.toggle('active', Number(btn.dataset['speed']) === s.speed);
      }
    };

    state.subscribe('change', render);
    state.subscribe('locale', render);
    this.root.append(this.pauseBtn, speedGroup);
    uiRoot.appendChild(this.root);
  }

  dispose(): void {
    this.root.remove();
  }
}