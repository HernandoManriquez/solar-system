import * as THREE from 'three';
import type { InteractionState } from './InteractionState';
import { toNDC } from './hitTest';
import type { BodyRig } from '../core/BodyFactory';

export interface Pickable {
  mesh: THREE.Object3D;
  bodyId: string;
}

/**
 * Centralized picking for mouse interaction. Maintains a registry of pickable
 * meshes (decoupled from individual mesh instances) and drives the shared
 * InteractionState on hover/click. Only the overview rigs are pickable.
 */
export class InteractionManager {
  private raycaster = new THREE.Raycaster();
  private pickables: Pickable[] = [];
  private lastHovered: string | null = null;
  private pointer = new THREE.Vector2();

  constructor(private state: InteractionState) {}

  setRigs(rigs: BodyRig[], extra: Pickable[] = []): void {
    this.pickables = rigs.map((r) => ({ mesh: r.group, bodyId: r.id }));
    this.pickables.push(...extra);
  }

  clearRigs(): void {
    this.pickables = [];
  }

  /** Update hover from pointer client coordinates over the canvas element. */
  updateHover(clientX: number, clientY: number, camera: THREE.Camera, dom: HTMLElement): void {
    const rect = dom.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const ndc = toNDC(clientX - rect.left, clientY - rect.top, rect.width, rect.height);
    this.pointer.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this.pointer, camera);

    const hit = this.intersect();
    if (hit !== this.lastHovered) {
      this.lastHovered = hit;
      this.state.setHovered(hit, { x: clientX, y: clientY });
    }
  }

  clearHover(): void {
    if (this.lastHovered !== null) {
      this.lastHovered = null;
      this.state.setHovered(null);
    }
  }

  /** Return the currently hovered body (raycast against latest pointer). */
  private intersect(): string | null {
    const targets = this.pickables.map((p) => p.mesh);
    const intersections = this.raycaster.intersectObjects(targets, true);
    if (intersections.length === 0) return null;
    const hit = intersections[0];
    // Walk up from the hit leaf until we find a body id (covers rings/moons).
    let node: THREE.Object3D | null = hit.object;
    while (node) {
      const id = node.userData['bodyId'] as string | undefined;
      if (id) return id;
      node = node.parent;
    }
    return null;
  }

  click(clientX: number, clientY: number, camera: THREE.Camera, dom: HTMLElement): void {
    this.updateHover(clientX, clientY, camera, dom);
    const id = this.lastHovered;
    if (id) {
      this.state.select(id);
    }
  }
}
