import * as THREE from 'three';
import type { BodyData } from '../data/types';

/**
 * Runtime procedural textures used as placeholders until licensed asset files
 * are available (see ADR-002). Surfaces are generated with deterministic value
 * noise (fBm) plus per-body detail so bodies never render as plain colored
 * spheres: fractured banding with storm streaks for gas giants, mottled rocky
 * surfaces with rimmed craters and polar caps, a recognisable Earth with
 * continents, deserts, ice and clouds, and a granulated Sun with limb
 * darkening and sunspots.
 */
export class ProceduralTextures {
  private cache = new Map<string, THREE.CanvasTexture>();
  private ringCache = new Map<string, THREE.CanvasTexture>();

  /** Radial ring texture (1D across the ring width) with gaps and banding. */
  getRingTexture(body: BodyData): THREE.CanvasTexture | null {
    if (!body.hasRings) return null;
    const cached = this.ringCache.get(body.id);
    if (cached) return cached;
    // The ring is a thin band varying only across its width (radius). We map
    // the ring texture U axis to the ring radius (see BodyFactory.addRing), so
    // the strip runs inner->outer along U. Use a wide, short canvas.
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, 'rgba(200,190,170,0.95)');
    grad.addColorStop(0.18, 'rgba(220,210,190,0.9)');
    grad.addColorStop(0.2, 'rgba(140,130,115,0.35)');
    grad.addColorStop(0.22, 'rgba(210,200,180,0.9)');
    grad.addColorStop(0.34, 'rgba(235,225,205,0.95)');
    grad.addColorStop(0.38, 'rgba(95,90,80,0.2)');
    grad.addColorStop(0.4, 'rgba(225,215,195,0.9)');
    grad.addColorStop(0.55, 'rgba(240,230,210,0.95)');
    grad.addColorStop(0.6, 'rgba(160,150,130,0.35)');
    grad.addColorStop(0.62, 'rgba(230,220,200,0.9)');
    grad.addColorStop(0.72, 'rgba(215,205,185,0.9)');
    grad.addColorStop(0.78, 'rgba(120,115,100,0.25)');
    grad.addColorStop(0.8, 'rgba(200,190,170,0.9)');
    grad.addColorStop(1.0, 'rgba(180,170,150,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 16);

    // Subtle fine ringlet striations across the ring face.
    const img = ctx.getImageData(0, 0, 512, 16);
    const d = img.data;
    for (let x = 0; x < 512; x++) {
      for (let y = 0; y < 16; y++) {
        const i = (y * 512 + x) * 4;
        const n = (this.noise1(x * 0.35) - 0.5) * 40;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
      }
    }
    ctx.putImageData(img, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.ringCache.set(body.id, texture);
    return texture;
  }

  getColorTexture(body: BodyData): THREE.CanvasTexture | null {
    const cached = this.cache.get(body.id);
    if (cached) return cached;
    const texture = this.make(body);
    if (!texture) return null;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.set(body.id, texture);
    return texture;
  }

  private make(body: BodyData): THREE.CanvasTexture | null {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const g = this.generator(body.id);
    switch (g.kind) {
      case 'bands':
        this.drawBands(ctx, g.stops, g.spot);
        break;
      case 'mottled':
        this.drawMottled(ctx, g.base, g.dark, g.craters, g.caps);
        break;
      case 'earth':
        this.drawEarth(ctx);
        break;
      case 'sun':
        this.drawSun(ctx);
        break;
      default:
        ctx.fillStyle = this.toCss(g.base);
        ctx.fillRect(0, 0, 1024, 512);
        break;
    }

    return new THREE.CanvasTexture(canvas);
  }

  private toCss(c: number): string {
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;
    return `rgb(${r},${g},${b})`;
  }

  private generator(id: string):
    | { kind: 'bands'; stops: string[]; spot?: boolean }
    | { kind: 'mottled'; base: number; dark: number; craters: number; caps?: boolean }
    | { kind: 'earth' }
    | { kind: 'sun' }
    | { kind: 'plain'; base: number } {
    switch (id) {
      case 'sun':
        return { kind: 'sun' };
      case 'jupiter':
        return { kind: 'bands', spot: true, stops: [
          'rgb(205,180,150)', 'rgb(230,205,170)', 'rgb(180,150,120)',
          'rgb(235,215,185)', 'rgb(150,120,95)', 'rgb(220,195,160)',
          'rgb(160,135,110)', 'rgb(230,210,180)', 'rgb(200,175,145)'] };
      case 'saturn':
        return { kind: 'bands', stops: [
          'rgb(220,205,175)', 'rgb(240,230,205)', 'rgb(200,185,155)',
          'rgb(235,225,200)', 'rgb(210,195,165)', 'rgb(225,215,190)'] };
      case 'uranus':
        return { kind: 'bands', stops: [
          'rgb(180,225,240)', 'rgb(160,210,235)', 'rgb(185,228,242)', 'rgb(165,215,238)'] };
      case 'neptune':
        return { kind: 'bands', stops: [
          'rgb(70,105,215)', 'rgb(55,90,200)', 'rgb(80,115,220)', 'rgb(60,100,210)'] };
      case 'venus':
        return { kind: 'bands', stops: [
          'rgb(235,200,140)', 'rgb(245,215,165)', 'rgb(220,180,120)', 'rgb(240,205,150)'] };
      case 'mercury':
        return { kind: 'mottled', base: 0x9a9a9a, dark: 0x6e6e6e, craters: 14 };
      case 'mars':
        return { kind: 'mottled', base: 0xd3752f, dark: 0x9e4a1a, craters: 8, caps: true };
      case 'earth':
        return { kind: 'earth' };
      case 'moon':
        return { kind: 'mottled', base: 0xcfcfcf, dark: 0x9a9a9a, craters: 20 };
      case 'io':
        return { kind: 'mottled', base: 0xe7c86f, dark: 0xb98f3a, craters: 5 };
      case 'europa':
        return { kind: 'mottled', base: 0xdcccb8, dark: 0xb9a58c, craters: 2 };
      case 'ganymede':
        return { kind: 'mottled', base: 0xa89a82, dark: 0x7c6f59, craters: 10 };
      case 'callisto':
        return { kind: 'mottled', base: 0x8a7a62, dark: 0x625545, craters: 24 };
      case 'titan':
        return { kind: 'mottled', base: 0xd9a24c, dark: 0x9e6f2a, craters: 2 };
      case 'triton':
        return { kind: 'mottled', base: 0xcfe0ee, dark: 0xa8bfd4, craters: 4 };
      default:
        return { kind: 'plain', base: 0x999999 };
    }
  }

  // ---- Deterministic value noise helpers ---------------------------------

  private hash(x: number, y: number): number {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  /** Smooth interpolated value noise in [0,1]. */
  private noise2(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = this.hash(xi, yi);
    const b = this.hash(xi + 1, yi);
    const c = this.hash(xi, yi + 1);
    const d = this.hash(xi + 1, yi + 1);
    const x1 = a + (b - a) * u;
    const x2 = c + (d - c) * u;
    return x1 + (x2 - x1) * v;
  }

  /** 1D smooth noise in [0,1] by sampling 2D noise along a line. */
  private noise1(x: number): number {
    return this.noise2(x, 3.7);
  }

  /** Fractal Brownian motion, roughly [-1,1]. */
  private fbm(x: number, y: number, octaves: number): number {
    let total = 0;
    let amp = 0.5;
    let freq = 1;
    let max = 0;
    for (let i = 0; i < octaves; i++) {
      total += (this.noise2(x * freq, y * freq) * 2 - 1) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2.05;
    }
    return total / max;
  }

  // ---- Surface generators -------------------------------------------------

  private drawBands(ctx: CanvasRenderingContext2D, stops: string[], spot = false): void {
    const W = 1024;
    const H = 512;
    const image = ctx.createImageData(W, H);
    const d = image.data;

    // Resolve stop colors.
    const cols = stops.map((s) => this.parseColor(s));

    for (let y = 0; y < H; y++) {
      const v = y / H;
      // Base band selection with a wavy, streaked bias so band edges undulate
      // and shear like the jet streams of a gas giant.
      const wave = this.fbm(y * 0.9, 0.3, 3) * 0.05 + Math.sin(y * 2.1) * 0.012;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        // Relatively sharp band edge with local shearing.
        const edge = this.fbm(u * 8, y * 1.2, 2);
        const localT = v + (edge - 0.5) * 0.06 + wave;
        const lf = Math.min(0.9999, Math.max(0, localT)) * (cols.length - 1);
        const j0 = Math.min(cols.length - 1, Math.floor(lf));
        const j1 = Math.min(cols.length - 1, j0 + 1);
        const lfrac = lf - j0;
        let r = this.lerp(cols[j0][0], cols[j1][0], lfrac);
        let g = this.lerp(cols[j0][1], cols[j1][1], lfrac);
        let b = this.lerp(cols[j0][2], cols[j1][2], lfrac);

        // Turbulence streaks: elongated longitudinal variations.
        const streak = this.fbm(u * 22, y * 0.16, 1);
        r += (streak - 0.5) * 26;
        g += (streak - 0.5) * 26;
        b += (streak - 0.5) * 26;

        // Fine grain between the band structure.
        const grain = (this.noise2(u * 160, y * 6) - 0.5) * 16;
        r += grain;
        g += grain;
        b += grain;

        // Pole darkening (thicker atmosphere at high latitude).
        const pole = Math.pow(Math.max(0, 1 - v * 2), 2) * 1.0;
        const pole2 = Math.pow(Math.max(0, v * 2 - 1), 2) * 1.0;
        const darken = Math.max(pole, pole2);
        r *= 1 - darken * 0.25;
        g *= 1 - darken * 0.25;
        b *= 1 - darken * 0.25;

        const p = (y * W + x) * 4;
        d[p] = Math.max(0, Math.min(255, r));
        d[p + 1] = Math.max(0, Math.min(255, g));
        d[p + 2] = Math.max(0, Math.min(255, b));
        d[p + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);

    if (spot) {
      // Jupiter's Great Red Spot with inner swirl.
      const sx = 660;
      const sy = 250;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.15);
      ctx.fillStyle = 'rgba(188,72,52,0.92)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 86, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(214,110,70,0.9)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 58, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,40,30,0.7)';
      ctx.beginPath();
      ctx.ellipse(-14, 0, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawMottled(ctx: CanvasRenderingContext2D, base: number, dark: number, craters: number, caps = false): void {
    const W = 1024;
    const H = 512;
    const image = ctx.createImageData(W, H);
    const d = image.data;
    const bp = this.hexToRgb(base);
    const dp = this.hexToRgb(dark);

    for (let y = 0; y < H; y++) {
      // Low-frequency regional variation (maria, darker / lighter terrain).
      const region = this.fbm(y * 0.9 + 5.0, 0.3, 3);
      // Per-pixel fine crinkle so the surface is not flat.
      const crinkle = this.noise2(y * 6 + 1.0, 3.3);
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const patch = this.fbm(u * 3 + 2.4, y * 1.5 + 7.1, 3);
        const g = (this.fbm(u * 24, y * 10, 2) - 0.5) * 0.5;

        // Blend toward dark or light terrain via fBm "continental" regions.
        const mix = 0.5 + 0.5 * patch;
        let r = bp[0] * (1 - mix) + dp[0] * mix;
        let gr = bp[1] * (1 - mix) + dp[1] * mix;
        let bl = bp[2] * (1 - mix) + dp[2] * mix;

        // Regional variation brightness.
        const shade = 1 + (region - 0.5) * 0.3;
        r *= shade;
        gr *= shade;
        bl *= shade;

        // Very fine grain.
        const grain = (crinkle - 0.5) * 14 + g * 22;
        r += grain;
        gr += grain;
        bl += grain;

        const p = (y * W + x) * 4;
        d[p] = Math.max(0, Math.min(255, r));
        d[p + 1] = Math.max(0, Math.min(255, gr));
        d[p + 2] = Math.max(0, Math.min(255, bl));
        d[p + 3] = 255;
      }
    }

    // Polar caps (e.g. Mars) with soft noise-edged boundaries.
    if (caps) {
      for (let y = 0; y < H; y++) {
        const v = y / H;
        const pole = Math.max(0, 1 - v * 4 * (1 - this.fbm(y * 6, 0.7, 2)));
        const poleB = Math.max(0, v * 4 - 3) * (1 - this.fbm(y * 6, 0.7, 2));
        const cap = Math.max(pole, poleB);
        for (let x = 0; x < W; x++) {
          const p = (y * W + x) * 4;
          const a = Math.min(1, cap * 3);
          d[p] = d[p] * (1 - a) + 238 * a;
          d[p + 1] = d[p + 1] * (1 - a) + 240 * a;
          d[p + 2] = d[p + 2] * (1 - a) + 250 * a;
        }
      }
    }
    ctx.putImageData(image, 0, 0);

    // Craters: raised rims (lit side) + dark floor, radially consistent.
    for (let c = 0; c < craters; c++) {
      const cx = 50 + Math.random() * (W - 100);
      const cy = 30 + Math.random() * (H - 60);
      const r = 6 + Math.random() * 16;
      const light = (this.noise2(cx, cy) - 0.5) * 0.4;
      const rim = this.toCss(this.shade(dark, 55));
      const floor = this.toCss(this.shade(dark, -30));
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = floor;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      // Partial bright rim facing the "light" direction.
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(
        cx - light * r * 0.3,
        cy - light * r * 0.3,
        r * 0.55,
        -Math.PI * 0.8,
        Math.PI * 0.2,
      );
      ctx.fill();
    }
  }

  private drawEarth(ctx: CanvasRenderingContext2D): void {
    const W = 1024;
    const H = 512;
    const image = ctx.createImageData(W, H);
    const d = image.data;
    const ocean = [34, 105, 178];
    const beach = [214, 196, 154];
    const grass = [72, 148, 66];
    const desert = [196, 168, 104];
    const rock = [128, 120, 110];

    for (let y = 0; y < H; y++) {
      const v = y / H;
      const latitude = Math.abs(v - 0.5) * 2; // 0 equator -> 1 pole
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const seed = this.noise2(u * 4 + 11.3, v * 4 + 3.9);
        const rough = this.fbm(u * 9, v * 9, 3);

        // Fractal continent mask with jagged coastlines.
        const e = this.fbm(u * 2.6 + 5.1, v * 2.6 + 0.4, 4);
        let elev = 0.55 + (e - 0.5) * 2.2 + (seed - 0.5) * 0.4;
        // Caribbean / archipelago modulation.
        elev -= rough * 0.12;

        let r: number, g: number, b: number;
        if (elev < 0.5) {
          // Ocean with depth shading.
          const depth = (0.5 - elev) / 0.5;
          r = ocean[0] * (1 - depth * 0.45);
          g = ocean[1] * (1 - depth * 0.45);
          b = ocean[2] + depth * 8;
          // Shallow water tint near coasts.
          const coast = Math.min(1, Math.max(0, (0.5 - elev) / 0.05));
          r = r * (1 - coast) + beach[0] * coast;
          g = g * (1 - coast) + beach[1] * coast;
          b = b * (1 - coast) + beach[2] * coast * 0.6;
        } else {
          // Land: green latitude bands toward desert at tropics, snow at poles.
          let landR = grass[0];
          let landG = grass[1];
          let landB = grass[2];
          const tropHeat = 1 - Math.max(0, Math.abs(latitude - 0.22) * 3);
          if (tropHeat > 0) {
            const m = Math.min(1, tropHeat);
            landR = landR * (1 - m) + desert[0] * m;
            landG = landG * (1 - m) + desert[1] * m;
            landB = landB * (1 - m) + desert[2] * m;
          }
          // Mountain rock at high elevation.
          const mountain = Math.min(1, Math.max(0, (elev - 0.82) / 0.18));
          landR = landR * (1 - mountain) + rock[0] * mountain;
          landG = landG * (1 - mountain) + rock[1] * mountain;
          landB = landB * (1 - mountain) + rock[2] * mountain;
          // Vegetation variation from fBm.
          const veg = this.fbm(u * 12 + 3.1, v * 12 + 9.2, 2);
          landR *= 0.9 + veg * 0.25;
          landG *= 0.9 + veg * 0.25;
          landB *= 0.9 + veg * 0.25;
          const snow = Math.min(1, Math.max(0, (latitude - 0.78) * 4));
          const eSnow = Math.min(1, Math.max(0, (elev - 0.9) / 0.1));
          const snowM = Math.min(1, snow + eSnow);
          landR = landR * (1 - snowM) + 240 * snowM;
          landG = landG * (1 - snowM) + 244 * snowM;
          landB = landB * (1 - snowM) + 250 * snowM;
          // Coast/inland variance.
          const inland = Math.min(1, Math.max(0, (elev - 0.5) / 0.12));
          r = landR * (0.92 + inland * 0.06);
          g = landG * (0.92 + inland * 0.06);
          b = landB * (0.92 + inland * 0.06);
        }

        // Fine surface grain.
        const grain = (this.noise2(u * 140, v * 70) - 0.5) * 8;
        r += grain;
        g += grain;
        b += grain;

        const p = (y * W + x) * 4;
        d[p] = Math.max(0, Math.min(255, r));
        d[p + 1] = Math.max(0, Math.min(255, g));
        d[p + 2] = Math.max(0, Math.min(255, b));
        d[p + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);

    // Soft polar ice caps.
    this.drawIce(ctx, 0);
    this.drawIce(ctx, H);

    // Cloud layer with turbulent wisps, masked to land/sea equally.
    const clouds = ctx.createImageData(W, H);
    const dc = clouds.data;
    for (let y = 0; y < H; y++) {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const c = this.fbm(u * 8 + 40.1, v * 11 + 17.2, 4);
        const bandCloud = Math.min(1, Math.max(0, (c - 0.42) * 3.2));
        const p = (y * W + x) * 4;
        dc[p] = 255;
        dc[p + 1] = 255;
        dc[p + 2] = 255;
        dc[p + 3] = Math.round(bandCloud * 235);
      }
    }
    ctx.putImageData(clouds, 0, 0);
  }

  private drawIce(ctx: CanvasRenderingContext2D, baseY: number): void {
    const W = 1024;
    const H = 512;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      // Distance from the pole (in polar-cap pixels) with wavy edge.
      const wave = this.fbm(y * 4 + 13.7, 0.4, 3);
      const edge = Math.abs(baseY === 0 ? y : H - y) + (wave - 0.5) * 46;
      const strength = Math.min(1, Math.max(0, (26 - edge) / 26));
      // Only blend on the correct side.
      if (baseY === 0 && y > 70) continue;
      if (baseY === H && y < H - 70) continue;
      if (strength <= 0) continue;
      for (let x = 0; x < W; x++) {
        const p = (y * W + x) * 4;
        const a = Math.min(1, strength);
        d[p] = d[p] * (1 - a) + 244 * a;
        d[p + 1] = d[p + 1] * (1 - a) + 248 * a;
        d[p + 2] = d[p + 2] * (1 - a) + 252 * a;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /** Solar surface: limb-darkened granulation plus a few sunspots. */
  private drawSun(ctx: CanvasRenderingContext2D): void {
    const W = 1024;
    const H = 512;
    const image = ctx.createImageData(W, H);
    const d = image.data;

    for (let y = 0; y < H; y++) {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        // Base warm color ramp (yellow-white core toward orange edges).
        let r = 255;
        let g = 225 + 20 * Math.sin(u * 0.5);
        let b = 150;

        // Granulation: fine high-frequency bright/dark convection cells.
        const gran = this.fbm(u * 60 + 1.0, v * 60 + 2.0, 3);
        const bright = 1 + (gran) * 0.28;
        r *= bright;
        g *= bright;
        b *= bright;

        // Medium-scale cell structure so granulation groups into supergranules.
        const sup = this.fbm(u * 9 + 41.0, v * 9 + 62.0, 2);
        r *= 1 + (sup - 0.5) * 0.12;
        g *= 1 + (sup - 0.5) * 0.12;
        b *= 1 + (sup - 0.5) * 0.12;

        // Limb darkening by latitude (stronger near the poles).
        const lat = Math.abs(v - 0.5) * 2;
        const limb = Math.min(1, Math.pow(lat, 1.6) * 0.55);
        r *= 1 - limb * 0.55;
        g *= 1 - limb * 0.6;
        b *= 1 - limb * 0.72;

        const p = (y * W + x) * 4;
        d[p] = Math.max(0, Math.min(255, r));
        d[p + 1] = Math.max(0, Math.min(255, g));
        d[p + 2] = Math.max(0, Math.min(255, b));
        d[p + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);

    // Sunspots with umbra + penumbra, avoiding the poles.
    for (let s = 0; s < 7; s++) {
      const cx = 120 + Math.random() * (W - 240);
      const cy = 100 + Math.random() * (H - 200);
      const r = 14 + Math.random() * 26;
      ctx.fillStyle = 'rgba(150,70,30,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.8, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(50,20,8,0.85)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.42, r * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- Color helpers -------------------------------------------------------

  private parseColor(s: string): [number, number, number] {
    const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    return [128, 128, 128];
  }

  private hexToRgb(c: number): [number, number, number] {
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private shade(c: number, amt: number): number {
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;
      const f = (v: number) => Math.max(0, Math.min(255, v + amt));
    return (f(r) << 16) | (f(g) << 8) | f(b);
  }
}
