import { Injectable } from "@angular/core";
import * as THREE from "three";
@Injectable({
  providedIn: "root",
})
export class MorphEffectService {
  private sparkleIntensities: Float32Array;

  constructor() {
    this.sparkleIntensities = new Float32Array(50000).fill(0); // Default to max particles
  }

  morphParticles(
    particles: THREE.Points,
    particleTargetPositions: Float32Array,
    clock: THREE.Clock,
    effectsConfig: { [key: string]: boolean }
  ) {
    const positions = particles.geometry.attributes["position"]
      .array as Float32Array;
    const colors = particles.geometry.attributes["color"].array as Float32Array;
    const elapsed = clock.getElapsedTime() * 0.4;

    // Helper function for pulse effects
    const applyPulseEffect = (index: number, opacity: number) => {
      if (effectsConfig["modelPulseRed"])
        colors[index] = 0.6 * Math.sin(elapsed * 2) * opacity;
      if (effectsConfig["modelPulseGreen"])
        colors[index + 1] = 0.3 * Math.sin(elapsed * 2.5) * opacity;
      if (effectsConfig["modelPulseBlue"]) {
        colors[index] =
          0.2 * Math.exp(-Math.abs(Math.cos(elapsed * 2))) * opacity;
        colors[index + 1] =
          0.6 * Math.exp(-Math.abs(Math.sin(elapsed * 2.5))) * opacity;
        colors[index + 2] =
          1 * Math.exp(-Math.abs(Math.cos(elapsed * 3))) * opacity;
      }
    };

    // Effects object with reusable functions
    const effects: {
      [key: string]: (
        index: number,
        posX: number,
        posY?: number,
        posZ?: number,
        i?: number
      ) => void;
    } = {
      modelSway: (index, posX) => {
        positions[index + 1] += Math.sin(elapsed * 3 + posX) * 0.009;
        positions[index] += (particleTargetPositions[index] - posX) * 0.005;
        positions[index + 2] +=
          (particleTargetPositions[index + 2] - positions[index + 2]) * 0.0005;
      },
      modelJump: (index, posX) => {
        positions[index + 2] += Math.sin(elapsed * 0.1 + posX) * 0.0008;
      },
      modelTrailcolors: (index, posX, posY, posZ) => {
        if (posY === undefined || posZ === undefined) return;
        const distance =
          Math.abs(particleTargetPositions[index] - posX) +
          Math.abs(particleTargetPositions[index + 1] - posY) +
          Math.abs(particleTargetPositions[index + 2] - posZ);
        const opacity = Math.max(0.2, 1 - distance * 0.025);

        applyPulseEffect(index, opacity);
      },
      modelFadeinDisappear: (index) => {
        const fadeFactor = 0.6 + 0.4 * Math.sin(elapsed * 3 + index);
        colors[index] *= fadeFactor;
        colors[index + 1] *= fadeFactor;
        colors[index + 2] *= fadeFactor;
      },
      modelBubbleHueShift: (index, _, __, ___, i) => {
        if (i === undefined) return;
        const hueShift = (elapsed * 0.01 + i * 0.01) % 1;
        colors[index] = hueShift;
        colors[index + 1] = 0.5 + 0.6 * Math.sin(elapsed * 1 + i);
        colors[index + 2] = 0.5 + 0.6 * Math.cos(elapsed * 1 + i);
      },
      modelSparkle: (index, _, __, ___, i) => {
        if (i === undefined) return;
        if (Math.random() < 0.005) this.sparkleIntensities[i] = 1;
        this.sparkleIntensities[i] *= 0.5;
        colors[index] += this.sparkleIntensities[i];
        colors[index + 1] += this.sparkleIntensities[i];
        colors[index + 2] += this.sparkleIntensities[i];
      },
    };

    const activeEffects = Object.entries(effects).filter(
      ([key]) => effectsConfig[key]
    );

    for (let i = 0; i < positions.length / 3; i++) {
      const index = i * 3;
      const posX = positions[index];
      const posY = positions[index + 1];
      const posZ = positions[index + 2];

      for (const [, effect] of activeEffects) {
        effect(index, posX, posY, posZ, i);
      }
    }

    particles.geometry.attributes["position"].needsUpdate = true;
    particles.geometry.attributes["color"].needsUpdate = true;
  }
}
