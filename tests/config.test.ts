import { describe, expect, it } from 'vitest';
import { getBody, getMoonsOf } from '../src/data/solarSystem';
import { VisualScale } from '../src/systems/VisualScale';
import { SOLAR_SYSTEM } from '../src/data/bodies';

describe('system config lookups', () => {
  it('finds bodies by id', () => {
    expect(getBody('earth')?.name).toBe('Earth');
    expect(getBody('sun')?.type).toBe('sun');
    expect(getBody('titan')?.type).toBe('moon');
    expect(getBody('nope')).toBeUndefined();
    expect(getBody(undefined)).toBeUndefined();
  });

  it('returns moons of a parent', () => {
    expect(getMoonsOf('jupiter').map((m) => m.id).sort()).toEqual([
      'callisto',
      'europa',
      'ganymede',
      'io',
    ]);
    expect(getMoonsOf('earth').map((m) => m.id)).toEqual(['moon']);
  });

  it('config values are valid', () => {
    expect(new VisualScale().validate(SOLAR_SYSTEM)).toEqual([]);
  });
});
