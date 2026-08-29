import { describe, expect, it } from 'vitest';
import { SOLAR_SYSTEM } from '../src/data/bodies';
import type { BodyData } from '../src/data/types';
import { VisualScale } from '../src/systems/VisualScale';

describe('solar system data', () => {
  it('has a sun, 8 planets, and 7 moons in order', () => {
    expect(SOLAR_SYSTEM.sun.type).toBe('sun');
    expect(SOLAR_SYSTEM.planets).toHaveLength(8);
    expect(SOLAR_SYSTEM.moons).toHaveLength(7);
    expect(SOLAR_SYSTEM.planets.map((p) => p.id).join(',')).toBe(
      'mercury,venus,earth,mars,jupiter,saturn,uranus,neptune',
    );
  });

  it('moons reference an existing parent planet', () => {
    const ids = new Set(SOLAR_SYSTEM.planets.map((p) => p.id));
    for (const m of SOLAR_SYSTEM.moons) {
      expect(ids.has(m.parent!)).toBe(true);
    }
  });

  it('every body has required fields and valid-positive values', () => {
    const all: BodyData[] = [SOLAR_SYSTEM.sun, ...SOLAR_SYSTEM.planets, ...SOLAR_SYSTEM.moons];
    for (const b of all) {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.id.length).toBeGreaterThan(0);
      expect(b.radiusKm).toBeGreaterThan(0);
      expect(Number.isFinite(b.orbitalDistanceKm)).toBe(true);
      expect(Number.isFinite(b.visual.sizeUnits)).toBe(true);
      expect(b.visual.sizeUnits).toBeGreaterThan(0);
    }
  });

  it('is valid according to VisualScale', () => {
    const errors = new VisualScale().validate(SOLAR_SYSTEM);
    expect(errors).toEqual([]);
  });

  it('every planet reports a confirmed moon count at least as large as the modeled moons', () => {
    for (const p of SOLAR_SYSTEM.planets) {
      expect(typeof p.confirmedMoons).toBe('number');
      expect(Number.isInteger(p.confirmedMoons)).toBe(true);
      expect(p.confirmedMoons!).toBeGreaterThanOrEqual(0);
      expect(p.confirmedMoons!).toBeGreaterThanOrEqual(p.moons.length);
    }
  });

  it('planets with rings are flagged and the prominent ring body has a ring map', () => {
    const rings = SOLAR_SYSTEM.planets.filter((p) => p.hasRings);
    expect(rings.length).toBeGreaterThan(0);
    // Saturn carries a real ring texture; Uranus renders its (faint) rings via
    // the procedural fallback, so it is intentionally not required to have one.
    const saturn = SOLAR_SYSTEM.planets.find((p) => p.id === 'saturn');
    expect(saturn).toBeDefined();
    expect(saturn!.hasRings).toBe(true);
    expect(saturn!.asset.ringMap).toBeTruthy();
  });
});
