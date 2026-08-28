import * as THREE from 'three';
import type { BodyData } from '../data/types';
import type { LoadResult } from '../systems/AssetLoader';
import { BodyMaterialFactory } from './BodyMaterialFactory';
import { getMoonsOf } from '../data/solarSystem';

export interface BodyRig {
  id: string;
  /** Root group placed in the scene at the orbit position. */
  group: THREE.Group;
  /** Rotation pivot (so the surface spins while keeping orientation). */
  pivot: THREE.Object3D;
  /** Main mesh used for raycasting / selection. */
  mesh: THREE.Mesh;
  /** Container that holds orbiting moons. */
  moonsGroup: THREE.Group;
}

/**
 * Builds a BodyRig from a body's data + loaded textures. The rig's surface
 * rotates on `pivot`; ring(s) are static relative to the pivot orientation;
 * moons orbit inside the planet-local `moonsGroup`.
 */
export class BodyFactory {
  private materials = new BodyMaterialFactory();

  buildBody(
    body: BodyData,
    textures: LoadResult,
    { includeMoons = true, scale = 1 }: { includeMoons?: boolean; scale?: number } = {},
  ): BodyRig {
    const group = new THREE.Group();
    group.name = body.id;
    group.userData['bodyId'] = body.id;
    // Scale the whole rig (surface, rings and moons) uniformly so the detail
    // view enlarges the entire body consistently instead of just the sphere.
    group.scale.setScalar(scale);

    const pivot = new THREE.Object3D();
    group.add(pivot);

    const geometry = new THREE.SphereGeometry(body.visual.sizeUnits, 48, 32);
    const material = this.materials.create(body, textures);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = body.name;
    mesh.userData['bodyId'] = body.id;
    pivot.add(mesh);

    if (body.hasRings) {
      this.addRing(pivot, body, textures);
    }

    const moonsGroup = new THREE.Group();
    group.add(moonsGroup);
    if (includeMoons) {
      for (const moon of getMoonsOf(body.id)) {
        this.addMoon(moonsGroup, moon);
      }
    }

    return { id: body.id, group, pivot, mesh, moonsGroup };
  }

  private addRing(host: THREE.Object3D, body: BodyData, textures: LoadResult): void {
    const size = body.visual.sizeUnits;
    const inner = size * 1.3;
    const outer = size * 2.2;
    const ringGeometry = new THREE.RingGeometry(inner, outer, 64, 1);
    // Map UVs radially so the ring texture spans the ring width.
    const uv = ringGeometry.attributes['uv'] as THREE.BufferAttribute;
    const pos = ringGeometry.attributes['position'] as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();
      // Map ring radius across the texture's U axis (ring textures are laid
      // out as a strip whose long axis spans inner->outer edge).
      const t = (r - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    const material = this.materials.createRing(body, textures);
    const ring = new THREE.Mesh(ringGeometry, material);
    ring.name = `${body.id}-rings`;
    ring.rotation.x = -Math.PI / 2;
    host.add(ring);
  }

  private addMoon(host: THREE.Group, moon: BodyData): void {
    const moonGroup = new THREE.Group();
    const moonGeometry = new THREE.SphereGeometry(moon.visual.sizeUnits, 24, 16);
    const moonMaterial = this.materials.createProceduralLocal(moon);
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.name = moon.name;
    moonMesh.userData['bodyId'] = moon.id;
    moonGroup.add(moonMesh);
    moonGroup.userData['moon'] = moon.id;
    host.add(moonGroup);
  }
}
