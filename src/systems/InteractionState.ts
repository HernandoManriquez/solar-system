export type ViewMode = 'overview' | 'detail';
export type Locale = 'en' | 'es';

export interface InteractionStateSnapshot {
  mode: ViewMode;
  hoveredId: string | null;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  locale: Locale;
  paused: boolean;
  speed: number;
  hoverScreen?: { x: number; y: number };
}

type EventName = 'change' | 'hover' | 'select' | 'return' | 'loading' | 'error' | 'locale';

type Listener = (snapshot: InteractionStateSnapshot) => void;

/**
 * Typed, observable interaction state shared between core (rendering) and
 * UI (DOM). Pure logic; no Three.js or DOM dependencies.
 */
export class InteractionState {
  private snapshot: InteractionStateSnapshot = {
    mode: 'overview',
    hoveredId: null,
    selectedId: null,
    loading: true,
    error: null,
    locale: 'en',
    paused: false,
    speed: 1,
  };

  private listeners = new Map<EventName, Set<Listener>>();

  get current(): InteractionStateSnapshot {
    return this.snapshot;
  }

  subscribe(event: EventName, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private emit(event: EventName): void {
    this.listeners.get(event)?.forEach((l) => l(this.snapshot));
    if (event !== 'change') this.listeners.get('change')?.forEach((l) => l(this.snapshot));
  }

  setMode(mode: ViewMode): void {
    if (this.snapshot.mode === mode) return;
    this.snapshot.mode = mode;
    if (mode === 'detail') this.emit('select');
    else if (mode === 'overview') this.emit('return');
  }

  getMode(): ViewMode {
    return this.snapshot.mode;
  }

  setHovered(id: string | null, screen?: { x: number; y: number }): void {
    this.snapshot.hoveredId = id;
    this.snapshot.hoverScreen = screen;
    this.emit('hover');
  }

  getHovered(): string | null {
    return this.snapshot.hoveredId;
  }

  select(id: string): void {
    this.snapshot.selectedId = id;
    this.setMode('detail');
  }

  getSelected(): string | null {
    return this.snapshot.selectedId;
  }

  clearSelection(): void {
    this.snapshot.selectedId = null;
    this.setMode('overview');
  }

  setLoading(loading: boolean): void {
    this.snapshot.loading = loading;
    this.emit('loading');
  }

  getLoading(): boolean {
    return this.snapshot.loading;
  }

  setError(error: string | null): void {
    this.snapshot.error = error;
    this.emit('error');
  }

  getError(): string | null {
    return this.snapshot.error;
  }

  setLocale(locale: Locale): void {
    if (this.snapshot.locale === locale) return;
    this.snapshot.locale = locale;
    this.listeners.get('locale')?.forEach((l) => l(this.snapshot));
    this.listeners.get('change')?.forEach((l) => l(this.snapshot));
  }

  getLocale(): Locale {
    return this.snapshot.locale;
  }

  setPaused(paused: boolean): void {
    if (this.snapshot.paused === paused) return;
    this.snapshot.paused = paused;
    this.emit('change');
  }

  togglePaused(): void {
    this.setPaused(!this.snapshot.paused);
  }

  getPaused(): boolean {
    return this.snapshot.paused;
  }

  setSpeed(speed: number): void {
    if (this.snapshot.speed === speed) return;
    this.snapshot.speed = speed;
    this.emit('change');
  }

  getSpeed(): number {
    return this.snapshot.speed;
  }
}
