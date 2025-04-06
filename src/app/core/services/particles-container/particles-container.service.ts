import { Injectable } from "@angular/core";
import * as THREE from "three";
import { FetchDataService } from "../fetch-data/fetch-data.service";
import { MorphEffectService } from "../morph-effect/morph-effect.service";
import { of, throwError } from 'rxjs';
import { switchMap, retryWhen, delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class ParticlesContainerService {
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private allModelVertices: THREE.Vector3[][] = [];
  private currentTargetIndex = 0;
  private maxParticles = 60000;
  private particles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleTargetPositions!: Float32Array;
  private particleColors!: Float32Array;
  private modelPosition: any;
  private clock = new THREE.Clock();
  private animation = false;
  //for morphParticles
  private modelSway = true;
  private modelJump = true;
  private modelTrailcolors = true;
  private modelPulseRed = false;
  private modelPulseGreen = false;
  private modelPulseBlue = true;
  private modelBubbleHueShift = false;
  private modelSparkle = true;
  private modelFadeinDisappear = true;
  public isModal = false;
  constructor(
    private dataService: FetchDataService,
    private morphService: MorphEffectService
  ) {
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
  }
  private onResize() {
    if (this.renderer && this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      this.renderer.setSize(width, height);
    }
  }
  //Initialise THREE.js system
  initThreeJS(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setSize(width, height);
  }
  /** Fetch and store particles for a given section */
  loadParticles(section: string): void {
    this.dataService.loadAllParticlesForSection(section).pipe(
      // Retry on error
      retryWhen(errors =>
        errors.pipe(
          tap(err => console.warn("Error loading particles, retrying...", err)),
          delay(1000)
        )
      ),
      // Check if data is empty, and retry if so
      switchMap((data) => {
        if (!data || data.length === 0 || data.every(arr => arr.length === 0)) {
          console.warn("Empty particle data, retrying...");
          // Throw to trigger retryWhen
          return throwError(() => new Error("Empty particle data"));
        }
        return of(data);
      })
    ).subscribe({
      next: (data) => {
        this.allModelVertices = data.map((particleArray) =>
          particleArray.map(
            (particle) => new THREE.Vector3(particle.x, particle.y, particle.z)
          )
        );
        this.modelPosition = this.dataService.fetchModelPosition(section);
        this.createModels();
      },
      error: (err) => {
        console.error("Failed to load particles after retries:", err);
      }
    });
  }

  // Load Models Sequentially and Extract Vertices
  private createModels() {
    if (this.particles) {
      // Dispose geometry
      this.disposeParticles();
    }

    // Start loading the first model
    const isMobile = this.isMobile();
    const targetVertices = this.allModelVertices[this.currentTargetIndex];
    const reducedParticleCount = this.isModal && isMobile ? 3000 : this.maxParticles;
    const particleCount =Math.min(reducedParticleCount, targetVertices.length);
    this.particlePositions = new Float32Array(particleCount * 3);
    this.particleTargetPositions = new Float32Array(particleCount * 3);
    this.particleColors = new Float32Array(this.maxParticles * 3);

    const positionOffset = this.modelPosition?.[this.currentTargetIndex]
      ?.xyz || [0, 0, 0];

    // Determine the positioning type for the current index
    for (let i = 0; i < particleCount; i++) {
      let { x, y, z } = targetVertices[i];
      this.particleTargetPositions[i * 3] = x + positionOffset[0];
      this.particleTargetPositions[i * 3 + 1] = y + positionOffset[1];
      this.particleTargetPositions[i * 3 + 2] = z + positionOffset[2];

      // Random initial positions
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Random colors
      this.particleColors[i * 3] = Math.random();
      this.particleColors[i * 3 + 1] = Math.random();
      this.particleColors[i * 3 + 2] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.particlePositions, 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.particleColors, 3)
    );

    //fetch texture
    const texture = new THREE.TextureLoader().load("texture/bright_64.webp");
    //define material
    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: isMobile ? 0.008 : 0.013,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map:   texture ?? undefined,
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.adjustCameraView();
    this.renderer.render(this.scene, this.camera);
  }
  private adjustCameraView() {
    const camData = this.modelPosition?.[this.currentTargetIndex];
    if (!camData) return;

    const camPosition = new THREE.Vector3(...camData.camera_position);
    const camLookAt = new THREE.Vector3(...camData.camera_lookat);

    if (!this.camera.position.equals(camPosition)) {
      this.camera.position.copy(camPosition);
      this.camera.lookAt(camLookAt);
      this.renderer.render(this.scene, this.camera);
    }

    this.animation = true;
  }

  animate() {
    if (!this.animation) return;

      requestAnimationFrame(() => this.animate());

      if (!this.particles) return;
    const positions = this.particles.geometry.attributes["position"]
      .array as Float32Array;

    for (let i = 0; i < this.particleTargetPositions.length; i++) {
      positions[i] += (this.particleTargetPositions[i] - positions[i]) * 0.15;
    }
    this;
    this.particles.geometry.attributes["position"].needsUpdate = true;
    this.morphParticles();

    if (this.modelPosition?.[this.currentTargetIndex]?.no_rotation_flag) {
      this.particles.rotation.y += 0;
    } else {
      this.particles.rotation.y += 0.015;
    }

    this.particles.position.x = this.camera.position.x * 0.25;
    this.particles.position.y = this.camera.position.y * 0.25;
    this.renderer.render(this.scene, this.camera);
  }
  setTarget() {
    if (this.allModelVertices.length === 0) return;

    this.currentTargetIndex =
      (this.currentTargetIndex + 1) % this.allModelVertices.length;
    const targetVertices = this.allModelVertices[this.currentTargetIndex];

    if (!targetVertices || targetVertices.length === 0) return;

    const positionOffset = this.modelPosition?.[this.currentTargetIndex]
      ?.xyz || [0, 0, 0];

    for (let i = 0; i < targetVertices.length; i++) {
      let { x, y, z } = targetVertices[i];
      this.particleTargetPositions[i * 3] = x + positionOffset[0];
      this.particleTargetPositions[i * 3 + 1] = y + positionOffset[1];
      this.particleTargetPositions[i * 3 + 2] = z + positionOffset[2];
    }

    this.particles.geometry.attributes["position"].needsUpdate = true;
    this.adjustCameraView();
  }
  resizeRenderer(): void {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setSize(width, height);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  morphParticles() {
    const effectsConfig = {
      modelSway: this.modelSway,
      modelJump: this.modelJump,
      modelTrailcolors: this.modelTrailcolors,
      modelPulseRed: this.modelPulseRed,
      modelPulseGreen: this.modelPulseGreen,
      modelPulseBlue: this.modelPulseBlue,
      modelBubbleHueShift: this.modelBubbleHueShift,
      modelSparkle: this.modelSparkle,
      modelFadeinDisappear: this.modelFadeinDisappear,
    };

    this.morphService.morphParticles(
      this.particles,
      this.particleTargetPositions,
      this.clock,
      effectsConfig
    );
  }

  // Function to update effect states dynamically from components
  morphEffect(effectName: string, value: boolean) {
    (this as any)[effectName] = value;
    this.morphParticles(); // Rerun the effect update
  }

  disposeParticles() {
      if (!this.particles) return;
    this.particles.geometry.dispose();
    if (Array.isArray(this.particles.material)) {
      this.particles.material.forEach((mat) => mat.dispose());
    } else {
      this.particles.material.dispose();
    }
    this.scene.remove(this.particles);
  }


  get index(): number {
    return this.currentTargetIndex;
  }
  get isAnimating(): boolean {
    return this.animation;
  }
  private isMobile(): boolean {
  return window.innerWidth < 768;
}

  destroy(): void {
  this.animation = false;

  // Dispose of geometry, materials, and remove from scene
  this.disposeParticles();

  // Dispose renderer
  if (this.renderer) {
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.renderer.domElement?.remove();
  }

  // Clear references
  this.scene = null as any;
  this.camera = null as any;
  this.renderer = null as any;
  this.particles = null as any;
  this.allModelVertices = [];
  this.particlePositions = null as any;
  this.particleTargetPositions = null as any;
  this.particleColors = null as any;
}

}
