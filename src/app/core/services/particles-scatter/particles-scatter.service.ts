import { Injectable } from "@angular/core";
import * as THREE from "three";

@Injectable({
  providedIn: "root",
})
export class ParticlesScatterService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private particleMaterial!: THREE.PointsMaterial;
  private particleGeometry!: THREE.BufferGeometry;
  private particleCount = 1200;
  private velocity: number = 0.002; // Default speed
  private direction = new THREE.Vector3(0, 1, 0); // Default movement down
  private sparkleIntensity = 0.5;
  private sparkleFrequency = 0.1;
  constructor() {
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
  }
  initThreeJS(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 6;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setSize(width, height);

    this.createParticles("texture/cross_64.webp").then(() => this.animate()); // Ensure particles are created before animation

  }

  private createParticles(texturePath: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.particles) {
        this.scene.remove(this.particles);
      }

      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(texturePath, (texture) => {

        this.particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const opacityArray = new Float32Array(this.particleCount);

        const boundary = 5;
        for (let i = 0; i < this.particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * boundary * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * boundary * 2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * boundary * 2;
          opacityArray[i] = Math.random();
        }

        this.particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        this.particleGeometry.setAttribute(
          "alpha",
          new THREE.BufferAttribute(opacityArray, 1)
        ); // Ensure alpha is set

        this.particleMaterial = new THREE.PointsMaterial({
          size: 0.035,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          map: texture,
          color: new THREE.Color(0xa7c8e9),
        });

        this.particles = new THREE.Points(
          this.particleGeometry,
          this.particleMaterial
        );
        this.scene.add(this.particles);

        resolve(); // Resolve the promise after particles are fully created
      },
      undefined,
     (error) => {
       // console.warn("Texture load failed, using fallback particle style.", error);
       this.setupParticles(); // fallback without texture
       resolve();
     }
    );

    });
  }

  // Function to control zoom
  setZoom(level: number) {
    this.camera.position.z = level;
  }
  // Function to control zoom
  setvelocity(level: number) {
    this.velocity = level;
  }
  setSparklingEffect(intensity: number, frequency: number) {
    this.sparkleIntensity = intensity;
    this.sparkleFrequency = frequency;
  }
  private setupParticles(texture?: THREE.Texture) {
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const opacityArray = new Float32Array(this.particleCount);

    const boundary = 5;
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boundary * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * boundary * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boundary * 2;
      opacityArray[i] = Math.random();
    }

    this.particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.particleGeometry.setAttribute(
      "alpha",
      new THREE.BufferAttribute(opacityArray, 1)
    );

    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map: texture || undefined,
      color: new THREE.Color(0xa7c8e9),
    });

    this.particles = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );
    this.scene.add(this.particles);
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
  resizeRenderer(): void {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setSize(width, height);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private animate = () => {
    if (!this.particles || !this.renderer || !this.camera || !this.scene) return;

// DOM check (optional but helpful):
if (!this.renderer.domElement || !document.body.contains(this.renderer.domElement)) return;


    requestAnimationFrame(this.animate);
    if (!this.particles) return;

    const positions = this.particleGeometry.attributes["position"].array;
    const opacityArray = this.particleGeometry.attributes["alpha"].array;

    const time = Date.now() * 0.005; // Increase multiplier for faster flicker

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += this.direction.y * this.velocity;
      if (positions[i + 1] > 5) positions[i + 1] = -5;

      // Increase twinkle effect by adjusting frequency and range
      opacityArray[i / 3] =
        0.3 +
        this.sparkleIntensity *
          Math.abs(Math.sin(time + i * this.sparkleFrequency));
    }

    this.particleGeometry.attributes["position"].needsUpdate = true;
    this.particleGeometry.attributes["alpha"].needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  };
}
