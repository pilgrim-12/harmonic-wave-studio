/**
 * Frequency Response Analysis Library
 * Calculates Amplitude-Frequency Response (AFR/АЧХ) and Phase-Frequency Response (PFR/ФЧХ)
 * Also includes Group Delay calculation
 */

import { FilterCoefficients } from "./digitalFilters";

export interface FrequencyResponseData {
  frequencies: number[];      // Frequency array (Hz or normalized)
  magnitude: number[];        // Magnitude response in dB
  phase: number[];           // Phase response in degrees
  magnitudeLinear: number[]; // Magnitude response (linear scale 0-1)
  phaseUnwrapped: number[];  // Unwrapped phase in degrees
  groupDelay: number[];      // Group delay in samples
}

export interface FrequencyResponseOptions {
  numPoints?: number;        // Number of frequency points (default: 512)
  minFreq?: number;          // Minimum frequency (normalized, default: 0.001)
  maxFreq?: number;          // Maximum frequency (normalized, default: 0.5 = Nyquist)
  logScale?: boolean;        // Use logarithmic frequency scale (default: false)
  sampleRate?: number;       // Sample rate for Hz conversion (default: 1 = normalized)
}

/**
 * Calculate complete frequency response for a digital filter
 */
export function calculateFrequencyResponse(
  coefficients: FilterCoefficients,
  options: FrequencyResponseOptions = {}
): FrequencyResponseData {
  const {
    numPoints = 512,
    minFreq = 0.001,
    maxFreq = 0.5,
    logScale = false,
    sampleRate = 1,
  } = options;

  const { a, b } = coefficients;

  // Generate frequency array
  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const magnitudeLinear: number[] = [];
  const phase: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    let normalizedFreq: number;

    if (logScale) {
      // Logarithmic spacing
      const logMin = Math.log10(minFreq);
      const logMax = Math.log10(maxFreq);
      normalizedFreq = Math.pow(10, logMin + (logMax - logMin) * (i / (numPoints - 1)));
    } else {
      // Linear spacing
      normalizedFreq = minFreq + (maxFreq - minFreq) * (i / (numPoints - 1));
    }

    // Convert to Hz if sample rate provided
    const freqHz = normalizedFreq * sampleRate;
    frequencies.push(freqHz);

    // Calculate H(e^jω) at this frequency
    const omega = 2 * Math.PI * normalizedFreq;

    // Evaluate numerator B(e^jω)
    let B_real = 0, B_imag = 0;
    for (let k = 0; k < b.length; k++) {
      B_real += b[k] * Math.cos(-omega * k);
      B_imag += b[k] * Math.sin(-omega * k);
    }

    // Evaluate denominator A(e^jω)
    let A_real = 0, A_imag = 0;
    for (let k = 0; k < a.length; k++) {
      A_real += a[k] * Math.cos(-omega * k);
      A_imag += a[k] * Math.sin(-omega * k);
    }

    // H(e^jω) = B(e^jω) / A(e^jω)
    const denom = A_real * A_real + A_imag * A_imag;

    if (denom < 1e-20) {
      // Avoid division by zero
      magnitudeLinear.push(0);
      magnitude.push(-100);
      phase.push(0);
      continue;
    }

    const H_real = (B_real * A_real + B_imag * A_imag) / denom;
    const H_imag = (B_imag * A_real - B_real * A_imag) / denom;

    // Magnitude (linear)
    const magLin = Math.sqrt(H_real * H_real + H_imag * H_imag);
    magnitudeLinear.push(magLin);

    // Magnitude (dB)
    const magDb = magLin > 1e-10 ? 20 * Math.log10(magLin) : -100;
    magnitude.push(magDb);

    // Phase (degrees)
    const phaseDeg = Math.atan2(H_imag, H_real) * (180 / Math.PI);
    phase.push(phaseDeg);
  }

  // Unwrap phase
  const phaseUnwrapped = unwrapPhase(phase);

  // Calculate group delay
  const groupDelay = calculateGroupDelay(phaseUnwrapped, frequencies);

  return {
    frequencies,
    magnitude,
    phase,
    magnitudeLinear,
    phaseUnwrapped,
    groupDelay,
  };
}

/**
 * Unwrap phase to avoid discontinuities at ±180°
 */
function unwrapPhase(phase: number[]): number[] {
  const unwrapped: number[] = [phase[0]];
  let offset = 0;

  for (let i = 1; i < phase.length; i++) {
    let diff = phase[i] - phase[i - 1];

    // Detect wrap-around
    if (diff > 180) {
      offset -= 360;
    } else if (diff < -180) {
      offset += 360;
    }

    unwrapped.push(phase[i] + offset);
  }

  return unwrapped;
}

/**
 * Calculate group delay from phase response
 * Group delay = -dφ/dω (in samples)
 */
function calculateGroupDelay(phaseUnwrapped: number[], frequencies: number[]): number[] {
  const groupDelay: number[] = [];

  for (let i = 0; i < phaseUnwrapped.length; i++) {
    if (i === 0) {
      // Forward difference at start
      const dPhase = phaseUnwrapped[1] - phaseUnwrapped[0];
      const dFreq = frequencies[1] - frequencies[0];
      groupDelay.push(dFreq !== 0 ? -dPhase / (360 * dFreq) : 0);
    } else if (i === phaseUnwrapped.length - 1) {
      // Backward difference at end
      const dPhase = phaseUnwrapped[i] - phaseUnwrapped[i - 1];
      const dFreq = frequencies[i] - frequencies[i - 1];
      groupDelay.push(dFreq !== 0 ? -dPhase / (360 * dFreq) : 0);
    } else {
      // Central difference
      const dPhase = phaseUnwrapped[i + 1] - phaseUnwrapped[i - 1];
      const dFreq = frequencies[i + 1] - frequencies[i - 1];
      groupDelay.push(dFreq !== 0 ? -dPhase / (360 * dFreq) : 0);
    }
  }

  return groupDelay;
}

/**
 * Find -3dB cutoff frequency
 */
export function find3dBCutoff(response: FrequencyResponseData): number | null {
  const target = response.magnitude[0] - 3; // -3dB from DC

  for (let i = 1; i < response.magnitude.length; i++) {
    if (response.magnitude[i] <= target) {
      // Linear interpolation for more accurate result
      const f1 = response.frequencies[i - 1];
      const f2 = response.frequencies[i];
      const m1 = response.magnitude[i - 1];
      const m2 = response.magnitude[i];

      const ratio = (target - m1) / (m2 - m1);
      return f1 + ratio * (f2 - f1);
    }
  }

  return null;
}

/**
 * Find bandwidth (frequencies where magnitude is above -3dB)
 */
export function findBandwidth(response: FrequencyResponseData): { lower: number; upper: number; bandwidth: number } | null {
  const maxMag = Math.max(...response.magnitude);
  const threshold = maxMag - 3;

  let lower = -1;
  let upper = -1;

  for (let i = 0; i < response.magnitude.length; i++) {
    if (response.magnitude[i] >= threshold) {
      if (lower < 0) lower = response.frequencies[i];
      upper = response.frequencies[i];
    }
  }

  if (lower < 0 || upper < 0) return null;

  return {
    lower,
    upper,
    bandwidth: upper - lower,
  };
}

/**
 * Calculate filter quality factor Q
 */
export function calculateQFactor(response: FrequencyResponseData): number | null {
  const bandwidth = findBandwidth(response);
  if (!bandwidth) return null;

  // Find center frequency (frequency of maximum magnitude)
  const maxIdx = response.magnitude.indexOf(Math.max(...response.magnitude));
  const centerFreq = response.frequencies[maxIdx];

  if (bandwidth.bandwidth === 0) return Infinity;

  return centerFreq / bandwidth.bandwidth;
}

/**
 * Generate frequency response for common filter types preview
 * (without actual filter coefficients - ideal response)
 */
export function generateIdealResponse(
  filterMode: "lowpass" | "highpass" | "bandpass" | "bandstop",
  cutoffFreq: number,
  order: number,
  options: FrequencyResponseOptions = {}
): FrequencyResponseData {
  const {
    numPoints = 512,
    minFreq = 0.001,
    maxFreq = 0.5,
    sampleRate = 1,
  } = options;

  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const magnitudeLinear: number[] = [];
  const phase: number[] = [];

  const normalizedCutoff = cutoffFreq / sampleRate;

  for (let i = 0; i < numPoints; i++) {
    const normalizedFreq = minFreq + (maxFreq - minFreq) * (i / (numPoints - 1));
    const freqHz = normalizedFreq * sampleRate;
    frequencies.push(freqHz);

    // Butterworth magnitude response approximation
    const freqRatio = normalizedFreq / normalizedCutoff;
    let magLin: number;

    switch (filterMode) {
      case "lowpass":
        magLin = 1 / Math.sqrt(1 + Math.pow(freqRatio, 2 * order));
        break;
      case "highpass":
        magLin = 1 / Math.sqrt(1 + Math.pow(1 / freqRatio, 2 * order));
        break;
      case "bandpass":
        // Simplified bandpass - actual implementation would need bandwidth
        const bp = freqRatio - 1 / freqRatio;
        magLin = 1 / Math.sqrt(1 + Math.pow(bp, 2 * order));
        break;
      case "bandstop":
        const bs = freqRatio - 1 / freqRatio;
        magLin = Math.abs(bs) / Math.sqrt(1 + Math.pow(bs, 2 * order));
        break;
      default:
        magLin = 1;
    }

    magnitudeLinear.push(magLin);
    magnitude.push(magLin > 1e-10 ? 20 * Math.log10(magLin) : -100);

    // Approximate phase (Butterworth)
    const phaseDeg = -order * Math.atan(freqRatio) * (180 / Math.PI);
    phase.push(phaseDeg);
  }

  const phaseUnwrapped = unwrapPhase(phase);
  const groupDelay = calculateGroupDelay(phaseUnwrapped, frequencies);

  return {
    frequencies,
    magnitude,
    phase,
    magnitudeLinear,
    phaseUnwrapped,
    groupDelay,
  };
}
