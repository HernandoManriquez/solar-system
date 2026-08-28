import { SOLAR_SYSTEM } from './bodies';
import type { BodyData, SolarSystemData } from './types';

export const SYSTEM: SolarSystemData = SOLAR_SYSTEM;

export function getBody(id: string | null | undefined): BodyData | undefined {
  if (!id) return undefined;
  if (SOLAR_SYSTEM.sun.id === id) return SOLAR_SYSTEM.sun;
  for (const p of SOLAR_SYSTEM.planets) if (p.id === id) return p;
  for (const m of SOLAR_SYSTEM.moons) if (m.id === id) return m;
  return undefined;
}

export function getBodiesForPicking(): BodyData[] {
  return [SOLAR_SYSTEM.sun, ...SOLAR_SYSTEM.planets];
}

export function getMoonsOf(parentId: string): BodyData[] {
  return SOLAR_SYSTEM.moons.filter((m) => m.parent === parentId);
}
