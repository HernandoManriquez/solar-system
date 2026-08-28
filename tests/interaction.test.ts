import { describe, expect, it } from 'vitest';
import { toNDC } from '../src/systems/hitTest';

describe('hit testing helpers', () => {
  it('converts a client point to NDC', () => {
    expect(toNDC(0, 0, 100, 100)).toEqual({ x: -1, y: 1 });
    expect(toNDC(50, 50, 100, 100)).toEqual({ x: 0, y: 0 });
    expect(toNDC(100, 100, 100, 100)).toEqual({ x: 1, y: -1 });
  });
});
