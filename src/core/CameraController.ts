import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BodyData } from '../data/types';
import type { VisualScale } from '../systems/VisualScale';

interface Pose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Animates the camera between overview and planet-detail poses using a simple
 * hand-rolled tween (no external dependency). Disables user controls during
 * the transition, re-enables them on completion.
 */
export class CameraController {
  private overviewPose: Pose | null = null;
  private start: Pose | null = null;
  private end: Pose | null = null;
  private progress = 0;
  private duration = 0;
  private transitioning = false;
  private onComplete: (() => void) | null = null;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private controls: OrbitControls,
    private scale: VisualScale,
  ) {}

  snapshotOverviewPose(): void {
    this.overviewPose = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };
  }

  isTransitioning(): boolean {
    return this.transitioning;
  }

  transitionToDetail(body: BodyData): void {
    const distance = this.scale.distanceForDetail(body);
    this.begin(
      {
        position: new THREE.Vector3(0, distance * 0.3, distance),
        target: new THREE.Vector3(0, 0, 0),
      },
      1400,
    );
  }

  returnToOverview(): void {
    if (!this.overviewPose) return;
    this.begin(this.overviewPose, 1400);
  }

  private begin(end: Pose, duration: number): void {
    this.start = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };
    this.end = end;
    this.progress = 0;
    this.duration = duration;
    this.transitioning = true;
    this.controls.enabled = false;
  }

  update(dt: number): void {
    if (!this.transitioning || !this.start || !this.end) return;
    this.progress += dt / (this.duration / 1000);
    if (this.progress >= 1) {
      this.progress = 1;
      this.apply(1);
      this.transitioning = false;
      this.controls.enabled = true;
      const cb = this.onComplete;
      this.onComplete = null;
      cb?.();
      return;
    }
    this.apply(this.progress);
  }

  private apply(t: number): void {
    const e = easeInOutCubic(t);
    this.camera.position.lerpVectors(this.start!.position, this.end!.position, e);
    this.controls.target.lerpVectors(this.start!.target, this.end!.target, e);
    this.controls.update();
  }
}
