export type BodyType = 'sun' | 'planet' | 'moon';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BodyAssets {
  colorMap?: string;
  normalMap?: string;
  bumpMap?: string;
  specularMap?: string;
  ringMap?: string;
}

export interface BodyVisual {
  sizeUnits: number;
  orbitRadiusUnits: number;
  orbitTilt: Vec3;
  rotationSpeed: number;
  orbitSpeed: number;
}

export interface BodyData {
  id: string;
  name: string;
  type: BodyType;
  parent?: string;
  radiusKm: number;
  orbitalDistanceKm: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  moons: string[];
  /** True total of confirmed natural satellites. Distinct from `moons`, which
   * lists only the notable ones modeled in the scene. */
  confirmedMoons?: number;
  hasRings: boolean;
  atmosphere: { present: boolean; description: string };
  description: string;
  funFact?: string;
  asset: BodyAssets;
  visual: BodyVisual;
}

export interface SolarSystemData {
  sun: BodyData;
  planets: BodyData[];
  moons: BodyData[];
}
