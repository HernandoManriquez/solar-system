import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SYSTEM, getBody } from '../data/solarSystem';
import { VisualScale } from '../systems/VisualScale';
import { OrbitController } from '../systems/OrbitController';
import { InteractionState } from '../systems/InteractionState';
import { InteractionManager } from '../systems/InteractionManager';
import { AssetLoader } from '../systems/AssetLoader';
import { Lighting } from './Lighting';
import { Background } from './Background';
import { SolarSystemView } from './SolarSystemView';
import { PlanetDetailView } from './PlanetDetailView';
import { CameraController } from './CameraController';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { ErrorOverlay } from '../ui/ErrorOverlay';
import { HoverTooltip } from '../ui/HoverTooltip';
import { InfoPanel } from '../ui/InfoPanel';
import { PlanetDetailPanel } from '../ui/PlanetDetailPanel';
import { ReturnButton } from '../ui/ReturnButton';
import { LocaleSelector } from '../ui/LocaleSelector';
import type { Locale } from '../systems/InteractionState';

/**
 * Composition root for the Three.js world: owns renderer, scene, camera,
 * controls, and the animation loop; wires views, interaction and UI state.
 */
export class App {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private solarSystemView: SolarSystemView;
  private detailView: PlanetDetailView;
  private cameraController: CameraController;
  private orbitController: OrbitController;
  private interaction: InteractionManager;
  private state = new InteractionState();
  private assetLoader = new AssetLoader();
  private loadingOverlay: LoadingOverlay;
  private errorOverlay: ErrorOverlay;
  private localeSelector: LocaleSelector;
  private raf = 0;
  private lastTime = 0;
  private speedMultiplier = 1;
  private disposed = false;

  constructor(private container: HTMLElement, private uiRoot: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 4000);
    this.camera.position.set(0, 30, 80);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 400;
    this.controls.target.set(0, 0, 0);

    // Lighting and Background add themselves to the scene in their constructors.
    new Lighting(this.scene);
    new Background(this.scene);

    const scale = new VisualScale();
    this.cameraController = new CameraController(this.camera, this.controls, scale);
    this.orbitController = new OrbitController(scale);

    this.solarSystemView = new SolarSystemView(this.scene, scale, this.assetLoader);
    this.detailView = new PlanetDetailView(this.scene, this.assetLoader);

    this.interaction = new InteractionManager(this.state);
    // NB: pickables are registered after the overview builds its rigs (see
    // start()), not here, because planetRigs is still empty at construction.

    this.loadingOverlay = new LoadingOverlay(this.state, this.uiRoot);
    this.errorOverlay = new ErrorOverlay(this.state, this.uiRoot);
    this.errorOverlay.setRetryHandler(() => {
      this.state.setError(null);
      window.location.reload();
    });
    new HoverTooltip(this.state, this.uiRoot);
    new InfoPanel(this.state, this.uiRoot);
    new PlanetDetailPanel(this.state, this.uiRoot);
    new ReturnButton(this.state, this.uiRoot);
    this.localeSelector = new LocaleSelector(this.state, this.uiRoot);
    this.applyPersistedLocale();

    this.assetLoader.setHandlers({
      onProgress: (loaded, total) => {
        this.loadingOverlay.setProgress(total > 0 ? loaded / total : 0);
      },
      // Asset load errors are non-fatal: the loader falls back to procedural
      // textures, so we never surface them as a blocking fatal error overlay.
      onError: () => undefined,
    });
  }

  private applyPersistedLocale(): void {
    try {
      const stored = localStorage.getItem('solar-system-locale');
      if (stored === 'en' || stored === 'es') {
        this.state.setLocale(stored as Locale);
      }
    } catch {
      /* storage may be unavailable; ignore */
    }
  }

  async start(): Promise<void> {
    this.resize();
    window.addEventListener('resize', this.resize);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerleave', this.onPointerLeave);
    this.renderer.domElement.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKey);
    this.state.subscribe('select', () => void this.enterDetail());
    this.state.subscribe('return', () => this.exitDetail());

    try {
      await this.solarSystemView.build();
      this.interaction.setRigs(this.solarSystemView.getAllRigs());
      this.snapshotOverviewPoseAfterBuild();
      // Clear transient asset errors so a missing texture is non-fatal.
      if (this.state.getError()) this.state.setError(null);
    } catch (err) {
      this.state.setError(err instanceof Error ? err.message : String(err));
      this.state.setLoading(false);
      return;
    }
    this.state.setLoading(false);
    this.lastTime = performance.now();
    this.loop();
  }

  private snapshotOverviewPoseAfterBuild(): void {
    this.camera.position.set(0, 30, 80);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.cameraController.snapshotOverviewPose();
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (this.state.getMode() === 'overview') {
      this.updateCursor();
      this.interaction.updateHover(e.clientX, e.clientY, this.camera, this.renderer.domElement);
    }
  };

  private onPointerLeave = (): void => {
    this.interaction.clearHover();
  };

  private onClick = (e: MouseEvent): void => {
    if (this.state.getMode() !== 'overview') return;
    this.interaction.click(e.clientX, e.clientY, this.camera, this.renderer.domElement);
  };

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.state.getMode() === 'detail') {
      this.state.clearSelection();
    }
  };

  private updateCursor(): void {
    const hovered = this.state.getHovered();
    this.renderer.domElement.style.cursor = hovered ? 'pointer' : 'default';
  }

  private async enterDetail(): Promise<void> {
    const body = getBody(this.state.getSelected());
    if (!body) return;
    // Hide overview and disable picking over it.
    this.interaction.clearHover();
    this.interaction.clearRigs();
    this.solarSystemView.setVisible(false);
    this.controls.enabled = false;
    try {
      await this.detailView.show(body);
    } catch (err) {
      this.state.setError(err instanceof Error ? err.message : String(err));
      return;
    }
    this.cameraController.transitionToDetail(body);
  }

  private exitDetail(): void {
    this.detailView.clear();
    this.solarSystemView.setVisible(true);
    this.interaction.setRigs(this.solarSystemView.getAllRigs());
    this.cameraController.returnToOverview();
  }

  private resize = (): void => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.controls.update();
    this.orbitController.advance(
      SYSTEM.planets,
      SYSTEM.moons,
      dt,
      this.speedMultiplier,
    );
    this.solarSystemView.applyMotion(this.orbitController);
    this.detailView.applyMotion(this.orbitController);
    this.cameraController.update(dt);
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKey);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave);
    this.renderer.domElement.removeEventListener('click', this.onClick);
    this.solarSystemView.dispose();
    this.detailView.dispose();
    this.loadingOverlay.dispose();
    this.errorOverlay.dispose();
    this.localeSelector.dispose();
    this.renderer.dispose();
  }
}
