/**
 * FFT (Fast Fourier Transform) Wrapper
 * Provides TypeScript interface for fft.js library
 */

import FFT from "fft.js";
import { FrequencySpectrum, FFTOptions, WindowFunction } from "@/types/fourier";

/**
 * Default FFT options
 */
const DEFAULT_FFT_OPTIONS: FFTOptions = {
  size: 2048,
  windowFunction: "hann",
  sampleRate: 60, // Default to 60 Hz (matches typical animation frame rate)
  includePhase: true,
};

/**
 * Compute FFT of a real-valued signal
 * @param signal - Input signal (time domain)
 * @param options - FFT computation options
 * @returns Frequency spectrum
 */
export function computeFFT(
  signal: number[],
  options: Partial<FFTOptions> = {}
): FrequencySpectrum {
  const opts = { ...DEFAULT_FFT_OPTIONS, ...options };

  // Ensure FFT size is power of 2
  const fftSize = nextPowerOfTwo(opts.size);

  // Pad or truncate signal to FFT size
  const paddedSignal = padSignal(signal, fftSize);

  // Apply window function
  const windowedSignal = applyWindow(paddedSignal, opts.windowFunction);

  // Create FFT instance
  const fft = new FFT(fftSize);

  // Prepare input (real and imaginary parts)
  const complexInput = new Array(fftSize * 2);
  for (let i = 0; i < fftSize; i++) {
    complexInput[i * 2] = windowedSignal[i]; // Real part
    complexInput[i * 2 + 1] = 0; // Imaginary part
  }

  // Compute FFT
  const complexOutput = fft.createComplexArray();
  fft.realTransform(complexOutput, complexInput);
  fft.completeSpectrum(complexOutput);

  // Extract magnitudes and phases
  const halfSize = Math.floor(fftSize / 2);
  const frequencies: number[] = [];
  const amplitudes: number[] = [];
  const phases: number[] = [];

  const frequencyResolution = opts.sampleRate / fftSize;

  for (let i = 0; i <= halfSize; i++) {
    const real = complexOutput[i * 2];
    const imag = complexOutput[i * 2 + 1];

    // Calculate magnitude
    const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;

    // Calculate phase (if requested)
    const phase = opts.includePhase ? Math.atan2(imag, real) : 0;

    frequencies.push(i * frequencyResolution);
    amplitudes.push(magnitude * 2); // Multiply by 2 to account for negative frequencies
    phases.push(phase);
  }

  return {
    frequencies,
    amplitudes,
    phases,
    sampleRate: opts.sampleRate,
    resolution: frequencyResolution,
    fftSize,
  };
}

/**
 * Find next power of 2 greater than or equal to n
 */
function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Pad or truncate signal to target length
 */
function padSignal(signal: number[], targetLength: number): number[] {
  if (signal.length === targetLength) {
    return [...signal];
  }

  const result = new Array(targetLength).fill(0);

  if (signal.length < targetLength) {
    // Pad with zeros
    for (let i = 0; i < signal.length; i++) {
      result[i] = signal[i];
    }
  } else {
    // Truncate
    for (let i = 0; i < targetLength; i++) {
      result[i] = signal[i];
    }
  }

  return result;
}

/**
 * Apply window function to signal
 */
export function applyWindow(
  signal: number[],
  windowType: WindowFunction
): number[] {
  const n = signal.length;
  const windowed = new Array(n);

  for (let i = 0; i < n; i++) {
    let windowValue = 1;

    switch (windowType) {
      case "hann":
        windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
        break;

      case "hamming":
        windowValue = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1));
        break;

      case "blackman":
        windowValue =
          0.42 -
          0.5 * Math.cos((2 * Math.PI * i) / (n - 1)) +
          0.08 * Math.cos((4 * Math.PI * i) / (n - 1));
        break;

      case "bartlett":
        windowValue = 1 - Math.abs((2 * i) / (n - 1) - 1);
        break;

      case "none":
      default:
        windowValue = 1;
        break;
    }

    windowed[i] = signal[i] * windowValue;
  }

  return windowed;
}

/**
 * Resample signal to target sample rate
 * Simple linear interpolation
 */
export function resampleSignal(
  signal: number[],
  originalRate: number,
  targetRate: number
): number[] {
  if (originalRate === targetRate) {
    return [...signal];
  }

  const ratio = originalRate / targetRate;
  const newLength = Math.floor(signal.length / ratio);
  const resampled = new Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const lowerIndex = Math.floor(originalIndex);
    const upperIndex = Math.min(lowerIndex + 1, signal.length - 1);
    const fraction = originalIndex - lowerIndex;

    // Linear interpolation
    resampled[i] =
      signal[lowerIndex] * (1 - fraction) + signal[upperIndex] * fraction;
  }

  return resampled;
}

/**
 * Normalize signal to [-1, 1] range
 */
export function normalizeSignal(signal: number[]): number[] {
  const maxAbs = Math.max(...signal.map(Math.abs));

  if (maxAbs === 0) {
    return signal.map(() => 0);
  }

  return signal.map((v) => v / maxAbs);
}

/**
 * Calculate signal energy (sum of squares)
 */
export function calculateSignalEnergy(signal: number[]): number {
  return signal.reduce((sum, val) => sum + val * val, 0);
}

/**
 * Remove DC offset from signal
 */
export function removeDCOffset(signal: number[]): number[] {
  const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
  return signal.map((val) => val - mean);
}
