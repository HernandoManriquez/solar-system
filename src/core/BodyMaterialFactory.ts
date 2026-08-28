import * as THREE from 'three';
import type { BodyData } from '../data/types';
import type { LoadResult } from '../systems/AssetLoader';
import { ProceduralTextures } from './ProceduralTextures';

const SUN_PLACEHOLDER: BodyData = {
  id: 'sun',
  name: 'Sun',
  type: 'sun',
  radiusKm: 0,
  orbitalDistanceKm: 0,
  orbitalPeriodDays: 0,
  rotationPeriodHours: 0,
  moons: [],
  hasRings: false,
  atmosphere: { present: true, description: '' },
  description: '',
  asset: {},
  visual: { sizeUnits: 1, orbitRadiusUnits: 0, orbitTilt: { x: 0, y: 0, z: 0 }, rotationSpeed: 0, orbitSpeed: 0 },
};

/**
 * Builds materials for a body. Uses supplied textures when available;
 * otherwise falls back to a recognizable procedural surface so a body is
 * never a flat single-color sphere.
 */
export class BodyMaterialFactory {
  private procedural = new ProceduralTextures();
  private enhancedCache = new Map<string, THREE.Texture>();

  create(body: BodyData, textures: LoadResult): THREE.Material {
    if (body.type === 'sun') {
      return this.createSun(textures);
    }
    if (textures.color) {
      const map = this.enhanceColor(body.id, textures.color);
      return new THREE.MeshStandardMaterial({
        map,
        normalMap: textures.normal ?? undefined,
        bumpMap: textures.bump ?? undefined,
        bumpScale: 0.05,
        roughness: 1,
        metalness: 0,
      });
    }
    const map = this.procedural.getColorTexture(body);
    return new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : this.colorFor(body.id),
      roughness: 1,
      metalness: 0,
    });
  }

  createSun(textures: LoadResult): THREE.MeshStandardMaterial {
    const map = textures.color ?? this.procedural.getColorTexture(SUN_PLACEHOLDER);
    return new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : 0xffaa33,
      emissive: 0xffe6a8,
      emissiveIntensity: 1.6,
      emissiveMap: map ?? undefined,
      roughness: 1,
      metalness: 0,
    });
  }

  /** Public so other factories can build a colored material. */
  createProceduralLocal(body: BodyData): THREE.MeshStandardMaterial {
    const map = this.procedural.getColorTexture(body);
    return new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : this.colorFor(body.id),
      roughness: 1,
    });
  }

  /**
   * Real color maps of the ice giants are nearly featureless (Uranus at 2k has
   * almost no tonal variation), so they read as flat colored balls. Composite a
   * subtle latitude-banded structure on top of the real map so the body keeps
   * its true hue yet renders as a textured planet. Done once, cached.
   */
  private enhanceColor(id: string, tex: THREE.Texture): THREE.Texture {
    if (id !== 'uranus') return tex;
    const cached = this.enhancedCache.get(id);
    if (cached) return cached;

    const w = 1024;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(tex.image as CanvasImageSource, 0, 0, w, h);

    // Latitude banding overlaid (translucent gray-blue via source-over keeps the
    // real cyan hue while revealing the subtle zonal structure of the planet).
    const band = document.createElement('canvas');
    band.width = w;
    band.height = h;
    const bctx = band.getContext('2d')!;
    const grad = bctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.12)'); // north pole
    grad.addColorStop(0.06, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.14, 'rgba(24, 34, 52, 0.30)'); // darker band
    grad.addColorStop(0.26, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.34, 'rgba(24, 34, 52, 0.32)'); // equator shadow
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.66, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.74, 'rgba(24, 34, 52, 0.30)');
    grad.addColorStop(0.88, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.14)'); // south pole
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, w, h);
    ctx.drawImage(band, 0, 0);

    // Faint speckle so the surface is not perfectly smooth.
    const speckle = document.createElement('canvas');
    speckle.width = w;
    speckle.height = h;
    const sctx = speckle.getContext('2d')!;
    const img = sctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 26 + 128;
      img.data[i] = n;
      img.data[i + 1] = n;
      img.data[i + 2] = n;
      img.data[i + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
    ctx.globalAlpha = 0.09;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(speckle, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.enhancedCache.set(id, texture);
    return texture;
  }

  /** Ring material: real texture when available, otherwise procedural. */
  createRing(body: BodyData, textures: LoadResult): THREE.MeshBasicMaterial {
    const map = textures.ring ?? this.procedural.getRingTexture(body);
    return new THREE.MeshBasicMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : 0xccccbb,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
  }

  private colorFor(id: string): number {
    const palette: Record<string, number> = {
      mercury: 0x8c8c8c,
      venus: 0xe6c489,
      earth: 0x2a6fdb,
      mars: 0xd35400,
      jupiter: 0xc8a06a,
      saturn: 0xd8c39a,
      uranus: 0x7fd4e8,
      neptune: 0x3a5fd0,
      moon: 0xbbbbbb,
      io: 0xe8c872,
      europa: 0xd8c9b8,
      ganymede: 0x9a8c72,
      callisto: 0x7a6a52,
      titan: 0xcf9b4a,
      triton: 0xbfd0e0,
    };
    return palette[id] ?? 0x999999;
  }
}
