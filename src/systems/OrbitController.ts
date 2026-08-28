import type { BodyData } from '../data/types';
import type { VisualScale } from './VisualScale';

export interface OrbitalPosition {
  angle: number;
  x: number;
  z: number;
}

function applyTilt(x: number, z: number, tiltZ: number): { x: number; y: number; z: number } {
  const y = 0;
  if (tiltZ === 0) return { x, y, z };
  const c = Math.cos(tiltZ);
  const s = Math.sin(tiltZ);
  return { x, y: -x * s, z: z * c };
}

/**
 * Pure orbital/rotational math. No Three.js imports. Advances orbital and
 * axial angles over real time and computes world positions from the visual
 * scale configuration.
 */
export class OrbitController {
  private orbitAngles = new Map<string, number>();
  private rotationAngles = new Map<string, number>();

  constructor(private scale: VisualScale) {}

  advanceOrbit(id: string, orbitSpeed: number, dt: number, speedMult: number): void {
    const angle = (this.orbitAngles.get(id) ?? 0) + orbitSpeed * dt * speedMult;
    this.orbitAngles.set(id, angle);
  }

  advanceRotation(id: string, rotationSpeed: number, dt: number): void {
    const angle = (this.rotationAngles.get(id) ?? 0) + rotationSpeed * dt;
    this.rotationAngles.set(id, angle);
  }

  currentOrbitAngle(id: string): number {
    return this.orbitAngles.get(id) ?? 0;
  }

  currentRotationAngle(id: string): number {
    return this.rotationAngles.get(id) ?? 0;
  }

  /** Compute the world position of a body given its orbit radius and tilt. */
  positionOf(body: BodyData, angle: number): { x: number; y: number; z: number } {
    const radius = this.scale.getOrbitRadiusUnits(body);
    if (radius <= 0) return { x: 0, y: 0, z: 0 };
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    return applyTilt(x, z, body.visual.orbitTilt.z ?? 0);
  }

  /** Advance a full system (planets and their moons) by a given frame delta. */
  advance(
    planets: BodyData[],
    moons: BodyData[],
    dt: number,
    speedMult: number,
  ): void {
    for (const p of planets) {
      this.advanceOrbit(p.id, p.visual.orbitSpeed, dt, speedMult);
      this.advanceRotation(p.id, p.visual.rotationSpeed, dt);
    }
    for (const m of moons) {
      this.advanceOrbit(m.id, m.visual.orbitSpeed, dt, speedMult);
      this.advanceRotation(m.id, m.visual.rotationSpeed, dt);
    }
  }
}
