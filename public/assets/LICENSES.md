# Asset Licensing

This directory holds raster texture assets used for the 3D bodies (and the background).

## Current status: real licensed assets

As of this update, the planet/sun color maps and Saturn's ring are **real raster assets**
distributed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license,
sourced from **Solar System Scope** (by INOVE). The app loads them at runtime; when a file is
missing or fails, it silently falls back to the procedural texture in
`src/core/ProceduralTextures.ts` (see ADR-002).

## Source & license

| Source | Notes | License |
|---|---|---|
| Solar System Scope (INOVE) — https://www.solarsystemscope.com/textures/ | Equirectangular planet maps (2k), Saturn ring alpha | **CC BY 4.0** — free to use, adapt, and share, commercially, with attribution |
| NASA / JPL | Source imagery used within the Solar System Scope pack | Derived; recorded via the pack's CC BY 4.0 |
| PlanetPixelEmporium | Not currently used | Free license with attribution; verify per asset |

Attribution text (to include where crediting this content):

> Textures from Solar System Scope (https://www.solarsystemscope.com/textures/),
> by INOVE, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).

## Rules

- **Never commit a third-party asset without recording its provenance and license in this
  document.**
- When a texture file is added, list it below with: path, source, license, and attribution.
- Keep sizes within budget: key bodies ≤2048×1024, smaller ≤1024×512; JPEG for color maps,
  PNG where alpha (rings) matters.
- If a referenced file is missing, the app silently falls back to the procedural texture.

## Committed files

All from Solar System Scope (INOVE), CC BY 4.0. Paths are relative to `public/assets/`:

| Path | Asset | Dimensions |
|---|---|---|
| `textures/sun/color.jpg` | Sun surface | 2048×1024 |
| `textures/mercury/color.jpg` | Mercury | 2048×1024 |
| `textures/venus/color.jpg` | Venus (surface) | 2048×1024 |
| `textures/earth/color.jpg` | Earth day map | 2048×1024 |
| `textures/mars/color.jpg` | Mars | 2048×1024 |
| `textures/jupiter/color.jpg` | Jupiter | 2048×1024 |
| `textures/saturn/color.jpg` | Saturn | 2048×1024 |
| `textures/saturn/ring.png` | Saturn ring (RGBA) | 2048×125 |
| `textures/uranus/color.jpg` | Uranus | 2048×1024 |
| `textures/neptune/color.jpg` | Neptune | 2048×1024 |

Notes:
- Earth `normal_map` / `specular_map` (referenced in `bodies.ts`) are only available as TIFF
  from the source, which the WebGL texture loader does not support; they are intentionally not
  bundled and fall back to `null` (no relief).
- Venus/Mercury/Mars referenced normal/bump maps are not bundled; the color maps alone render.
- Moons use lightweight procedural materials (not asset files).
