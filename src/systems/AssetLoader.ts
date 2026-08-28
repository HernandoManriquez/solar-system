import * as THREE from 'three';
import type { BodyData } from '../data/types';

export interface LoadResult {
  color: THREE.Texture | null;
  normal: THREE.Texture | null;
  bump: THREE.Texture | null;
  specular: THREE.Texture | null;
  ring: THREE.Texture | null;
}

export interface AssetLoadHandlers {
  onProgress?: (loaded: number, total: number) => void;
  onError?: (message: string) => void;
}

const BASE = import.meta.env.BASE_URL || './';
// Body asset paths (e.g. "textures/sun/color.jpg") are relative to the
// assets root (public/assets/ at dev time, ./assets/ in the build).
const ASSET_BASE = `${BASE}assets/`;

/**
 * Loads texture assets with progress reporting and graceful fallback.
 * Missing textures NEVER reject or trigger a fatal error: the caller receives
 * null and falls back to a procedural material (see BodyMaterialFactory).
 * TextureLoader caches reused paths automatically.
 */
export class AssetLoader {
  private loader: THREE.TextureLoader;
  private ringLoader: THREE.TextureLoader;
  private pending = 0;
  private loadedCount = 0;
  private silent = true;
  private handlers: AssetLoadHandlers = {};

  constructor(
    private colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace,
    silent = true,
  ) {
    this.silent = silent;
    this.loader = new THREE.TextureLoader();
    this.ringLoader = new THREE.TextureLoader();
  }

  setHandlers(h: AssetLoadHandlers): void {
    this.handlers = h;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  private notifyProgress(): void {
    this.handlers.onProgress?.(this.loadedCount, Math.max(this.pending, this.loadedCount));
  }

  private loadOne(loader: THREE.TextureLoader, path: string): Promise<THREE.Texture | null> {
    this.pending += 1;
    this.notifyProgress();
    return new Promise((resolve) => {
      // Only attempt to load assets that actually exist; otherwise resolve null
      // silently so a missing (not-yet-purchased) texture is non-fatal and
      // produces no 404 noise.
      fetch(`${ASSET_BASE}${path}`, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            this.loadedCount += 1;
            this.notifyProgress();
            if (!this.silent) {
              this.handlers.onError?.(`Asset not found: ${path}`);
            }
            resolve(null);
            return;
          }
          loader.load(
            ASSET_BASE + path,
            (tex) => {
              tex.colorSpace = this.colorSpace;
              tex.anisotropy = 4;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.ClampToEdgeWrapping;
              this.loadedCount += 1;
              this.notifyProgress();
              resolve(tex);
            },
            undefined,
            (err) => {
              this.loadedCount += 1;
              this.notifyProgress();
              if (!this.silent) {
                this.handlers.onError?.(
                  `Failed to load asset ${path}: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
              resolve(null);
            },
          );
        })
        .catch(() => {
          this.loadedCount += 1;
          this.notifyProgress();
          resolve(null);
        });
    });
  }

  /** Load all maps for a body. Returns partial result if any map fails. */
  async loadBody(body: BodyData): Promise<LoadResult> {
    const [color, normal, bump, specular, ring] = await Promise.all([
      body.asset.colorMap ? this.loadOne(this.loader, body.asset.colorMap) : null,
      body.asset.normalMap ? this.loadOne(this.loader, body.asset.normalMap) : null,
      body.asset.bumpMap ? this.loadOne(this.loader, body.asset.bumpMap) : null,
      body.asset.specularMap ? this.loadOne(this.loader, body.asset.specularMap) : null,
      body.asset.ringMap ? this.loadOne(this.ringLoader, body.asset.ringMap) : null,
    ]);
    return { color, normal, bump, specular, ring };
  }
}
