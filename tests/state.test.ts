import { describe, expect, it, vi } from 'vitest';
import { InteractionState } from '../src/systems/InteractionState';

describe('InteractionState', () => {
  it('starts in overview, loading, no error', () => {
    const state = new InteractionState();
    expect(state.getMode()).toBe('overview');
    expect(state.getLoading()).toBe(true);
    expect(state.getError()).toBeNull();
  });

  it('emits hover and updates hovered id', () => {
    const state = new InteractionState();
    let seen: string | null = 'x';
    state.subscribe('hover', (s) => { seen = s.hoveredId; });
    state.setHovered('mars', { x: 10, y: 20 });
    expect(seen).toBe('mars');
    expect(state.getHovered()).toBe('mars');
    state.setHovered(null);
    expect(state.getHovered()).toBeNull();
  });

  it('selecting switches to detail and back via clearSelection', () => {
    const state = new InteractionState();
    const onSelect = vi.fn();
    const onReturn = vi.fn();
    state.subscribe('select', onSelect);
    state.subscribe('return', onReturn);

    state.select('jupiter');
    expect(state.getMode()).toBe('detail');
    expect(state.getSelected()).toBe('jupiter');
    expect(onSelect).toHaveBeenCalledTimes(1);

    state.clearSelection();
    expect(state.getMode()).toBe('overview');
    expect(state.getSelected()).toBeNull();
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it('tracks loading and error with emissions', () => {
    const state = new InteractionState();
    const onError = vi.fn();
    state.subscribe('error', onError);
    state.setLoading(false);
    expect(state.getLoading()).toBe(false);
    state.setError('boom');
    expect(state.getError()).toBe('boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listeners', () => {
    const state = new InteractionState();
    let count = 0;
    const unsub = state.subscribe('hover', () => count++);
    state.setHovered('a');
    unsub();
    state.setHovered('b');
    expect(count).toBe(1);
  });
});
