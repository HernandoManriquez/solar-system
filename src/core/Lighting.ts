import * as THREE from 'three';

/**
 * Scene lighting. An ambient fill, a subtle directional light for shape, and
 * a warm PointLight at the Sun so planets are realistically lit from one side.
 */
export class Lighting {
  readonly sunLight: THREE.PointLight;

  constructor(scene: THREE.Scene) {
    scene.add(new THREE.AmbientLight(0x404060, 0.5));

    const dir = new THREE.DirectionalLight(0xffffff, 0.3);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    this.sunLight = new THREE.PointLight(0xfff0d0, 2.5, 0, 2);
    this.sunLight.position.set(0, 0, 0);
    scene.add(this.sunLight);
  }
}
