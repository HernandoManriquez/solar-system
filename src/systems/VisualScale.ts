import type { BodyData } from '../data/types';
import { getMoonsOf } from '../data/solarSystem';

export interface ScaleConfig {
  globalSpeedMultiplier: number;
  /** Detail-view uniform scale applied to the whole body rig (surface+rings+moons). */
  detailScale: number;
  /** Extra framing headroom so the body is not flush against the view bounds. */
  detailFramingMargin: number;
  /** Vertical field of view of the camera, used to compute framing distance. */
  cameraFov: number;
  /** Legacy option kept for backward compatibility; not used in framing. */
  cameraDistanceFactor: number;
}

const DEFAULT_CONFIG: ScaleConfig = {
  globalSpeedMultiplier: 1,
  detailScale: 2.2,
  detailFramingMargin: 1.25,
  cameraFov: 55,
  cameraDistanceFactor: 3,
};

/**
 * Maps astronomical values to visualization values.
 * The per-body visual parameters (sizeUnits, orbitRadiusUnits, speeds) are
 * precomputed in data/bodies.ts. This module provides derived quantities
 * (e.g. camera framing distance) and validates that all values are finite
 * and positive where required.
 */
export class VisualScale {
  private config: ScaleConfig;

  constructor(config: Partial<ScaleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Effective rendering radius of a body (units). */
  getSizeUnits(body: BodyData): number {
    return body.visual.sizeUnits;
  }

  /** Effective orbit radius of a body (units). Sun returns 0. */
  getOrbitRadiusUnits(body: BodyData): number {
    return body.visual.orbitRadiusUnits;
  }

  /** Camera distance for a focused planet detail view so the whole body, its
   * rings and its moons fit inside the view with margin. */
  distanceForDetail(body: BodyData): number {
    const scaledExtent = this.detailExtent(body) * this.config.detailScale;
    const halfFov = (this.config.cameraFov / 2) * (Math.PI / 180);
    const base = scaledExtent / Math.tan(halfFov);
    return base * this.config.detailFramingMargin;
  }

  /** Maximum visual radius (unscaled) of the body including rings and moons. */
  private detailExtent(body: BodyData): number {
    let extent = body.visual.sizeUnits;
    if (body.hasRings) {
      // addRing uses an outer radius of sizeUnits * 2.2.
      extent = Math.max(extent, body.visual.sizeUnits * 2.2);
    }
    for (const moon of getMoonsOf(body.id)) {
      extent = Math.max(extent, moon.visual.orbitRadiusUnits);
    }
    return extent;
  }

  getGlobalSpeedMultiplier(): number {
    return this.config.globalSpeedMultiplier;
  }

  /** Validate a data set is renderable and understandable. */
  validate(data: { sun: BodyData; planets: BodyData[]; moons: BodyData[] }): string[] {
    const errors: string[] = [];
    const check = (label: string, value: number, positive: boolean) => {
      if (!Number.isFinite(value)) {
        errors.push(`${label} must be a finite number (got ${value})`);
      } else if (positive && value <= 0) {
        errors.push(`${label} must be positive (got ${value})`);
      }
    };

    if (data.sun.visual.sizeUnits <= 0) {
      errors.push(`sun.sizeUnits must be positive (got ${data.sun.visual.sizeUnits})`);
    }

    let prevRadius = data.sun.visual.orbitRadiusUnits;
    for (const p of data.planets) {
      check(`planet ${p.id} sizeUnits`, p.visual.sizeUnits, true);
      check(`planet ${p.id} orbitRadiusUnits`, p.visual.orbitRadiusUnits, true);
      check(`planet ${p.id} rotationSpeed`, p.visual.rotationSpeed, true);
      check(`planet ${p.id} orbitSpeed`, p.visual.orbitSpeed, true);
      if (p.visual.orbitRadiusUnits <= prevRadius) {
        errors.push(
          `planet ${p.id} orbitRadiusUnits must increase toward the edge (${p.visual.orbitRadiusUnits} <= ${prevRadius})`,
        );
      }
      prevRadius = p.visual.orbitRadiusUnits;
    }

    for (const m of data.moons) {
      check(`moon ${m.id} sizeUnits`, m.visual.sizeUnits, true);
      check(`moon ${m.id} orbitRadiusUnits`, m.visual.orbitRadiusUnits, true);
      check(`moon ${m.id} orbitSpeed`, m.visual.orbitSpeed, true);
    }

    return errors;
  }
}
