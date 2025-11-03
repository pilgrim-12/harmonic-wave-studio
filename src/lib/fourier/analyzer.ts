/**
 * Frequency Spectrum Analyzer
 * Peak detection, harmonic analysis, and signal metrics
 */

import {
  FrequencySpectrum,
  FrequencyPeak,
  Harmonic,
  FFTAnalysisResult,
  PeakDetectionOptions,
} from "@/types/fourier";
import { computeFFT, removeDCOffset, calculateSignalEnergy } from "./fft";

/**
 * Default peak detection options
 */
const DEFAULT_PEAK_OPTIONS: PeakDetectionOptions = {
  threshold: 0.1, // 10% of max amplitude
  minFrequency: 0.1, // Ignore DC and very low frequencies
  maxFrequency: Infinity,
  maxPeaks: 20,
  minPeakDistance: 0.5, // Hz
};

/**
 * Analyze signal and return complete FFT analysis
 * @param signal - Y-values of signal
 * @param sampleRate - Sample rate in Hz
 * @param peakOptions - Peak detection options
 * @returns Complete FFT analysis result
 */
export function analyzeSignal(
  signal: number[],
  sampleRate: number = 60,
  peakOptions: Partial<PeakDetectionOptions> = {}
): FFTAnalysisResult {
  // Remove DC offset
  const cleanSignal = removeDCOffset(signal);

  // Compute FFT
  const spectrum = computeFFT(cleanSignal, {
    size: 2048,
    windowFunction: "hann",
    sampleRate,
    includePhase: true,
  });

  // Detect peaks
  const peaks = findPeaks(spectrum, {
    ...DEFAULT_PEAK_OPTIONS,
    ...peakOptions,
  });

  // Find fundamental frequency
  const fundamentalFrequency = estimateFundamentalFrequency(peaks);

  // Analyze harmonics
  const harmonics =
    fundamentalFrequency !== null
      ? findHarmonics(spectrum, fundamentalFrequency, peaks)
      : [];

  // Calculate THD
  const thd = calculateTHD(harmonics);

  // Calculate total energy
  const totalEnergy = calculateSignalEnergy(cleanSignal);

  // DC offset (0 Hz component)
  const dcOffset = spectrum.amplitudes[0];

  return {
    spectrum,
    peaks,
    harmonics,
    fundamentalFrequency,
    thd,
    dcOffset,
    totalEnergy,
    timestamp: Date.now(),
  };
}

/**
 * Find peaks in frequency spectrum
 */
export function findPeaks(
  spectrum: FrequencySpectrum,
  options: PeakDetectionOptions
): FrequencyPeak[] {
  const { frequencies, amplitudes, phases } = spectrum;
  const peaks: FrequencyPeak[] = [];

  // Find maximum amplitude for normalization
  const maxAmplitude = Math.max(...amplitudes);

  if (maxAmplitude === 0) {
    return peaks;
  }

  const absoluteThreshold = maxAmplitude * options.threshold;

  // Find local maxima
  for (let i = 1; i < amplitudes.length - 1; i++) {
    const freq = frequencies[i];

    // Skip if outside frequency range
    if (freq < options.minFrequency || freq > options.maxFrequency) {
      continue;
    }

    const amplitude = amplitudes[i];

    // Check if it's a local maximum and above threshold
    if (
      amplitude > absoluteThreshold &&
      amplitude > amplitudes[i - 1] &&
      amplitude > amplitudes[i + 1]
    ) {
      peaks.push({
        frequency: freq,
        amplitude: amplitude,
        phase: phases[i],
        index: i,
        relativeAmplitude: amplitude / maxAmplitude,
      });
    }
  }

  // Sort peaks by amplitude (descending)
  peaks.sort((a, b) => b.amplitude - a.amplitude);

  // Filter peaks that are too close to each other (keep the stronger one)
  const filteredPeaks: FrequencyPeak[] = [];

  for (const peak of peaks) {
    const isTooClose = filteredPeaks.some(
      (existingPeak) =>
        Math.abs(peak.frequency - existingPeak.frequency) <
        options.minPeakDistance
    );

    if (!isTooClose) {
      filteredPeaks.push(peak);
    }

    // Stop if we reached max peaks
    if (filteredPeaks.length >= options.maxPeaks) {
      break;
    }
  }

  return filteredPeaks;
}

/**
 * Estimate fundamental frequency from peaks
 * Uses the lowest significant peak as fundamental
 */
export function estimateFundamentalFrequency(
  peaks: FrequencyPeak[]
): number | null {
  if (peaks.length === 0) {
    return null;
  }

  // Find the lowest frequency peak (excluding DC)
  const sortedByFrequency = [...peaks].sort(
    (a, b) => a.frequency - b.frequency
  );

  for (const peak of sortedByFrequency) {
    if (peak.frequency > 0.1) {
      // Ignore DC and very low frequencies
      return peak.frequency;
    }
  }

  return null;
}

/**
 * Find harmonic components based on fundamental frequency
 */
export function findHarmonics(
  spectrum: FrequencySpectrum,
  fundamentalFreq: number,
  peaks: FrequencyPeak[]
): Harmonic[] {
  const harmonics: Harmonic[] = [];
  const tolerance = fundamentalFreq * 0.1; // 10% tolerance

  // Calculate total energy in peaks
  const totalEnergy = peaks.reduce(
    (sum, peak) => sum + peak.amplitude * peak.amplitude,
    0
  );

  // Check for harmonics (multiples of fundamental)
  for (let order = 1; order <= 10; order++) {
    const expectedFreq = fundamentalFreq * order;

    // Find peak closest to expected harmonic frequency
    const harmonic = peaks.find(
      (peak) => Math.abs(peak.frequency - expectedFreq) < tolerance
    );

    if (harmonic) {
      const energy = harmonic.amplitude * harmonic.amplitude;
      const energyPercentage = (energy / totalEnergy) * 100;

      harmonics.push({
        order,
        frequency: harmonic.frequency,
        amplitude: harmonic.amplitude,
        phase: harmonic.phase,
        energyPercentage,
      });
    }
  }

  return harmonics;
}

/**
 * Calculate Total Harmonic Distortion (THD)
 * THD = sqrt(sum of harmonic powers) / fundamental power
 */
export function calculateTHD(harmonics: Harmonic[]): number {
  if (harmonics.length === 0) {
    return 0;
  }

  const fundamental = harmonics.find((h) => h.order === 1);

  if (!fundamental || fundamental.amplitude === 0) {
    return 0;
  }

  // Sum of squares of harmonic amplitudes (excluding fundamental)
  const harmonicsPowerSum = harmonics
    .filter((h) => h.order > 1)
    .reduce((sum, h) => sum + h.amplitude * h.amplitude, 0);

  const fundamentalPower = fundamental.amplitude * fundamental.amplitude;

  const thd = Math.sqrt(harmonicsPowerSum / fundamentalPower) * 100;

  return thd;
}

/**
 * Get top N frequency peaks
 */
export function getTopPeaks(
  peaks: FrequencyPeak[],
  n: number
): FrequencyPeak[] {
  return peaks.slice(0, n);
}

/**
 * Format frequency for display
 */
export function formatFrequency(freq: number): string {
  if (freq < 1) {
    return `${(freq * 1000).toFixed(0)} mHz`;
  } else if (freq < 1000) {
    return `${freq.toFixed(2)} Hz`;
  } else {
    return `${(freq / 1000).toFixed(2)} kHz`;
  }
}

/**
 * Format amplitude for display
 */
export function formatAmplitude(amplitude: number): string {
  return amplitude.toFixed(4);
}
