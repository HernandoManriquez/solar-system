import * as THREE from 'three';

/**
 * Deep-space background: a large starfield of Points plus a few soft galaxy
 * sprites. Kept dim and distant so it stays visually subordinate to the
 * Solar System while conveying outer space.
 */
export class Background {
  readonly group: THREE.Group = new THREE.Group();

  constructor(scene: THREE.Scene, count = 1500) {
    this.buildStars(count);
    this.buildGalaxies();
    scene.background = new THREE.Color(0x03030a);
    scene.add(this.group);
  }

  private buildStars(count: number): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute within a large sphere shell.
      const r = 900 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const tint = 0.6 + Math.random() * 0.4;
      colors[i * 3] = tint;
      colors[i * 3 + 1] = tint;
      colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
      sizes[i] = 1 + Math.random() * 2;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const stars = new THREE.Points(geometry, material);
    stars.userData['isBackground'] = true;
    this.group.add(stars);
  }

  /** A few soft radial-gradient galaxy sprites. */
  private buildGalaxies(): void {
    for (let i = 0; i < 5; i++) {
      const texture = this.makeGalaxyTexture();
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: [0x5577bb, 0x8844aa, 0x336699, 0x774477, 0x4466aa][i % 5],
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
        }),
      );
      const r = 700 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      sprite.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.5,
        r * Math.cos(phi),
      );
      const s = 150 + Math.random() * 180;
      sprite.scale.set(s, s * 0.6, 1);
      sprite.userData['isBackground'] = true;
      this.group.add(sprite);
    }
  }

  private makeGalaxyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.4, 'rgba(200,200,255,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
