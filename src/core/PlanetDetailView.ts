import * as THREE from 'three';
import type { BodyData } from '../data/types';
import { SYSTEM } from '../data/solarSystem';
import { OrbitController } from '../systems/OrbitController';
import { AssetLoader } from '../systems/AssetLoader';
import { BodyFactory, type BodyRig } from './BodyFactory';

/** Single-planet focus view: planet at larger scale with moons and rings. */
export class PlanetDetailView {
  readonly detailGroup: THREE.Group = new THREE.Group();
  rig: BodyRig | null = null;

  private bodyFactory = new BodyFactory();

  constructor(private scene: THREE.Scene, private assets: AssetLoader) {
    this.scene.add(this.detailGroup);
    this.detailGroup.visible = false;
  }

  setVisible(visible: boolean): void {
    this.detailGroup.visible = visible;
  }

  async show(body: BodyData): Promise<void> {
    this.clear();
    const textures = await this.assets.loadBody(body);
    const rig = this.bodyFactory.buildBody(body, textures, { scale: 2.2 });
    // Center the focus body at the origin.
    rig.group.position.set(0, 0, 0);
    this.detailGroup.add(rig.group);
    this.rig = rig;
    this.detailGroup.visible = true;
  }

  applyMotion(controller: OrbitController): void {
    if (!this.rig) return;
    const planet = SYSTEM.planets.find((p) => p.id === this.rig!.id);
    if (!planet) return;
    this.rig.pivot.rotation.y = controller.currentRotationAngle(this.rig.id);
    this.rig.moonsGroup.children.forEach((moonContainer) => {
      const moonId = moonContainer.userData['moon'] as string | undefined;
      if (!moonId) return;
      const moon = SYSTEM.moons.find((m) => m.id === moonId);
      if (!moon) return;
      const angle = controller.currentOrbitAngle(moonId);
      const r = moon.visual.orbitRadiusUnits;
      moonContainer.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    });
  }

  clear(): void {
    if (this.rig) {
      this.detailGroup.remove(this.rig.group);
      this.disposeRig(this.rig);
      this.rig = null;
    }
    this.detailGroup.visible = false;
  }

  private disposeRig(rig: BodyRig): void {
    rig.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
  }

  dispose(): void {
    this.clear();
    this.scene.remove(this.detailGroup);
  }
}
