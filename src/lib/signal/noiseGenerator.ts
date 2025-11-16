/**
 * Noise Generation Library
 * Generates various types of noise for signal processing
 */

import { NoiseType } from "@/types/signal";

/**
 * Generate white noise (uniform random distribution)
 */
export function generateWhiteNoise(
  length: number,
  amplitude: number = 1.0
): number[] {
  const noise: number[] = [];
  for (let i = 0; i < length; i++) {
    noise.push((Math.random() * 2 - 1) * amplitude);
  }
  return noise;
}

/**
 * Generate pink noise (1/f noise)
 * Using the Voss-McCartney algorithm
 */
export function generatePinkNoise(
  length: number,
  amplitude: number = 1.0
): number[] {
  const noise: number[] = [];
  const numOctaves = 16;
  const octaves: number[] = new Array(numOctaves).fill(0);

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let j = 0; j < numOctaves; j++) {
      if ((i & (1 << j)) === 0) {
        octaves[j] = Math.random() * 2 - 1;
      }
      sum += octaves[j];
    }
    noise.push((sum / numOctaves) * amplitude);
  }

  return noise;
}

/**
 * Generate brown noise (1/f² noise, Brownian noise)
 * Using random walk
 */
export function generateBrownNoise(
  length: number,
  amplitude: number = 1.0
): number[] {
  const noise: number[] = [];
  let value = 0;
  const step = amplitude * 0.02;

  for (let i = 0; i < length; i++) {
    value += (Math.random() * 2 - 1) * step;
    value = Math.max(-amplitude, Math.min(amplitude, value));
    noise.push(value);
  }

  return noise;
}

/**
 * Generate Gaussian noise
 * Using Box-Muller transform
 */
export function generateGaussianNoise(
  length: number,
  amplitude: number = 1.0
): number[] {
  const noise: number[] = [];

  for (let i = 0; i < length; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    noise.push(z0 * amplitude);
    if (i + 1 < length) {
      noise.push(z1 * amplitude);
    }
  }

  return noise.slice(0, length);
}

/**
 * Generate impulse noise (salt and pepper)
 */
export function generateImpulseNoise(
  length: number,
  amplitude: number = 1.0,
  probability: number = 0.05
): number[] {
  const noise: number[] = new Array(length).fill(0);

  for (let i = 0; i < length; i++) {
    if (Math.random() < probability) {
      noise[i] = Math.random() < 0.5 ? -amplitude : amplitude;
    }
  }

  return noise;
}

/**
 * Generate sine wave noise (periodic interference)
 */
export function generateSineNoise(
  length: number,
  amplitude: number = 1.0,
  frequency: number = 5.0,
  sampleRate: number = 100
): number[] {
  const noise: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    noise.push(amplitude * Math.sin(2 * Math.PI * frequency * t));
  }

  return noise;
}

/**
 * Calculate SNR (Signal-to-Noise Ratio)
 */
export function calculateSNR(signal: number[], noise: number[]): number {
  const signalPower =
    signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
  const noisePower =
    noise.reduce((sum, val) => sum + val * val, 0) / noise.length;

  return 10 * Math.log10(signalPower / noisePower);
}

/**
 * Scale noise to achieve target SNR
 */
export function scaleNoiseToSNR(
  signal: number[],
  noise: number[],
  targetSNR: number
): number[] {
  const currentSNR = calculateSNR(signal, noise);
  const scaleFactor = Math.pow(10, (currentSNR - targetSNR) / 20);

  return noise.map((n) => n * scaleFactor);
}

/**
 * Add noise to signal with specified SNR
 */
export function addNoiseWithSNR(
  signal: number[],
  noiseType: NoiseType,
  snrDB: number,
  frequency?: number,
  sampleRate: number = 100
): number[] {
  let noise: number[] = [];

  switch (noiseType) {
    case "white":
      noise = generateWhiteNoise(signal.length, 1.0);
      break;
    case "pink":
      noise = generatePinkNoise(signal.length, 1.0);
      break;
    case "brown":
      noise = generateBrownNoise(signal.length, 1.0);
      break;
    case "gaussian":
      noise = generateGaussianNoise(signal.length, 1.0);
      break;
    case "impulse":
      noise = generateImpulseNoise(signal.length, 1.0, 0.05);
      break;
    case "sine":
      noise = generateSineNoise(
        signal.length,
        1.0,
        frequency || 5.0,
        sampleRate
      );
      break;
    default:
      noise = generateWhiteNoise(signal.length, 1.0);
  }

  // Scale noise to achieve target SNR
  const scaledNoise = scaleNoiseToSNR(signal, noise, snrDB);

  // Add noise to signal
  return signal.map((s, i) => s + scaledNoise[i]);
}

/**
 * Generate noise of specified type
 */
export function generateNoise(
  type: NoiseType,
  length: number,
  amplitude: number = 1.0,
  frequency: number = 5.0,
  sampleRate: number = 100
): number[] {
  switch (type) {
    case "white":
      return generateWhiteNoise(length, amplitude);
    case "pink":
      return generatePinkNoise(length, amplitude);
    case "brown":
      return generateBrownNoise(length, amplitude);
    case "gaussian":
      return generateGaussianNoise(length, amplitude);
    case "impulse":
      return generateImpulseNoise(length, amplitude);
    case "sine":
      return generateSineNoise(length, amplitude, frequency, sampleRate);
    default:
      return generateWhiteNoise(length, amplitude);
  }
}
