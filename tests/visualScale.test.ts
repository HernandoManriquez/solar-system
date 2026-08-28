import { describe, expect, it } from 'vitest';
import { SOLAR_SYSTEM } from '../src/data/bodies';
import { PLANET_COUNT_INVALID } from './fixtures';
import { VisualScale } from '../src/systems/VisualScale';

describe('VisualScale', () => {
  it('maps sizes and orbit radii from data', () => {
    const scale = new VisualScale();
    const earth = SOLAR_SYSTEM.planets.find((p) => p.id === 'earth')!;
    expect(scale.getSizeUnits(earth)).toBe(earth.visual.sizeUnits);
    expect(scale.getOrbitRadiusUnits(earth)).toBe(earth.visual.orbitRadiusUnits);
  });

  it('detail distance scales with body size', () => {
    const scale = new VisualScale({ cameraDistanceFactor: 3 });
    const big = SOLAR_SYSTEM.planets.find((p) => p.id === 'jupiter')!;
    const small = SOLAR_SYSTEM.planets.find((p) => p.id === 'mercury')!;
    expect(scale.distanceForDetail(big)).toBeGreaterThan(scale.distanceForDetail(small));
  });

  it('reports no errors for the real data set', () => {
    expect(new VisualScale().validate(SOLAR_SYSTEM)).toEqual([]);
  });

  it('reports errors for invalid data', () => {
    const errors = new VisualScale().validate(PLANET_COUNT_INVALID);
    expect(errors.length).toBeGreaterThan(0);
  });
});
