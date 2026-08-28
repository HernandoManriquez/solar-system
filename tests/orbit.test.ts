import { describe, expect, it } from 'vitest';
import { SOLAR_SYSTEM } from '../src/data/bodies';
import { OrbitController } from '../src/systems/OrbitController';
import { VisualScale } from '../src/systems/VisualScale';

describe('OrbitController', () => {
  it('advances orbital angle by speed * dt * multiplier and stays finite', () => {
    const controller = new OrbitController(new VisualScale());
    const earth = SOLAR_SYSTEM.planets.find((p) => p.id === 'earth')!;
    const before = controller.currentOrbitAngle('earth');
    const dt = 0.5;
    controller.advanceOrbit('earth', earth.visual.orbitSpeed, dt, 1);
    const after = controller.currentOrbitAngle('earth');
    expect(after).toBeCloseTo(before + earth.visual.orbitSpeed * dt);
    expect(Number.isFinite(after)).toBe(true);
  });

  it('computes a position on the orbit radius for an angle', () => {
    const scale = new VisualScale();
    const controller = new OrbitController(scale);
    const earth = SOLAR_SYSTEM.planets.find((p) => p.id === 'earth')!;
    const pos = controller.positionOf(earth, 0);
    expect(pos.x).toBeCloseTo(scale.getOrbitRadiusUnits(earth));
    expect(pos.z).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo(0);
  });

  it('returns origin for the sun (zero orbit radius)', () => {
    const controller = new OrbitController(new VisualScale());
    const pos = controller.positionOf(SOLAR_SYSTEM.sun, 1);
    expect(pos.x).toBe(0);
    expect(pos.z).toBe(0);
  });

  it('no NaN after advancing the whole system many frames', () => {
    const controller = new OrbitController(new VisualScale());
    for (let i = 0; i < 500; i++) {
      controller.advance(SOLAR_SYSTEM.planets, SOLAR_SYSTEM.moons, 0.016, 2);
    }
    for (const p of SOLAR_SYSTEM.planets) {
      expect(Number.isFinite(controller.currentOrbitAngle(p.id))).toBe(true);
      expect(Number.isFinite(controller.currentRotationAngle(p.id))).toBe(true);
    }
  });

  it('respects the global speed multiplier', () => {
    const controller = new OrbitController(new VisualScale());
    const earth = SOLAR_SYSTEM.planets.find((p) => p.id === 'earth')!;
    controller.advanceOrbit('earth', earth.visual.orbitSpeed, 1, 0.5);
    const half = controller.currentOrbitAngle('earth');
    const controller2 = new OrbitController(new VisualScale());
    controller2.advanceOrbit('earth', earth.visual.orbitSpeed, 1, 1.0);
    expect(half).toBeLessThan(controller2.currentOrbitAngle('earth'));
  });
});
