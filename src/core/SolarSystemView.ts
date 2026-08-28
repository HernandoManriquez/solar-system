import * as THREE from 'three';
import type { BodyData } from '../data/types';
import { SYSTEM } from '../data/solarSystem';
import { VisualScale } from '../systems/VisualScale';
import { OrbitController } from '../systems/OrbitController';
import { AssetLoader } from '../systems/AssetLoader';
import { BodyFactory, type BodyRig } from './BodyFactory';

/** Overview: Sun at center + planets on visible orbits with moving bodies. */
export class SolarSystemView {
  readonly overviewGroup: THREE.Group = new THREE.Group();
  readonly planetRigs: BodyRig[] = [];
  sunRig: BodyRig | null = null;
  readonly orbitLines: THREE.LineLoop[] = [];

  private bodyFactory = new BodyFactory();
  private ready = false;

  constructor(
    private scene: THREE.Scene,
    private scale: VisualScale,
    private assets: AssetLoader,
  ) {
    this.scene.add(this.overviewGroup);
  }

  setVisible(visible: boolean): void {
    this.overviewGroup.visible = visible;
  }

  async build(): Promise<void> {
    const sunTextures = await this.assets.loadBody(SYSTEM.sun);
    this.sunRig = this.bodyFactory.buildBody(SYSTEM.sun, sunTextures, { includeMoons: false });
    this.overviewGroup.add(this.sunRig.group);
    this.addSunGlow();

    for (const planet of SYSTEM.planets) {
      const textures = await this.assets.loadBody(planet);
      const rig = this.bodyFactory.buildBody(planet, textures);
      this.overviewGroup.add(rig.group);
      this.planetRigs.push(rig);
      this.orbitLines.push(this.buildOrbitLine(planet));
    }

    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  /** All pickable rigs in the overview: the Sun plus every planet. */
  getAllRigs(): BodyRig[] {
    return this.sunRig ? [this.sunRig, ...this.planetRigs] : [...this.planetRigs];
  }

  /** Adds a soft radial halo behind the Sun so it reads as a glowing star. */
  private addSunGlow(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,240,190,0.9)');
    grad.addColorStop(0.35, 'rgba(255,190,90,0.45)');
    grad.addColorStop(0.7, 'rgba(255,140,60,0.15)');
    grad.addColorStop(1, 'rgba(255,120,50,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: 0xffcc88,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const radius = this.scale.getSizeUnits(SYSTEM.sun);
    sprite.scale.set(radius * 4.5, radius * 4.5, 1);
    sprite.position.set(0, 0, 0);
    sprite.userData['isBackground'] = true;
    this.overviewGroup.add(sprite);
  }

  private buildOrbitLine(body: BodyData): THREE.LineLoop {
    const radius = this.scale.getOrbitRadiusUnits(body);
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(a),
          0,
          radius * Math.sin(a),
        ),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.25,
    });
    const line = new THREE.LineLoop(geometry, material);
    line.rotation.z = body.visual.orbitTilt.z ?? 0;
    this.overviewGroup.add(line);
    return line;
  }

  /** Advance bodies and reposition rigs based on current orbital angles. */
  applyMotion(controller: OrbitController): void {
    if (this.sunRig) {
      this.sunRig.pivot.rotation.y = controller.currentRotationAngle('sun');
    }
    for (const rig of this.planetRigs) {
      const planet = SYSTEM.planets.find((p) => p.id === rig.id);
      if (!planet) continue;
      const angle = controller.currentOrbitAngle(rig.id);
      const pos = controller.positionOf(planet, angle);
      rig.group.position.set(pos.x, pos.y, pos.z);
      rig.pivot.rotation.y = controller.currentRotationAngle(rig.id);
      this.positionMoons(rig, controller);
    }
  }

  private positionMoons(rig: BodyRig, controller: OrbitController): void {
    rig.moonsGroup.children.forEach((moonContainer) => {
      const moonId = moonContainer.userData['moon'] as string | undefined;
      if (!moonId) return;
      const moon = SYSTEM.moons.find((m) => m.id === moonId);
      if (!moon) return;
      const angle = controller.currentOrbitAngle(moonId);
      const r = moon.visual.orbitRadiusUnits;
      moonContainer.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    });
  }

  dispose(): void {
    this.overviewGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.scene.remove(this.overviewGroup);
  }
}
