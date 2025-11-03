/**
 * FFT Analysis Types
 * Types for frequency domain analysis and spectrum visualization
 */

/**
 * Frequency spectrum data
 */
export interface FrequencySpectrum {
  /** Frequency values in Hz */
  frequencies: number[];

  /** Magnitude values (amplitude) */
  amplitudes: number[];

  /** Phase values in radians */
  phases: number[];

  /** Sample rate in Hz */
  sampleRate: number;

  /** Frequency resolution (Hz per bin) */
  resolution: number;

  /** FFT size used */
  fftSize: number;
}

/**
 * A single peak in the frequency spectrum
 */
export interface FrequencyPeak {
  /** Peak frequency in Hz */
  frequency: number;

  /** Peak amplitude (magnitude) */
  amplitude: number;

  /** Phase at this frequency in radians */
  phase: number;

  /** Bin index in FFT result */
  index: number;

  /** Relative amplitude (0-1, normalized to max peak) */
  relativeAmplitude: number;
}

/**
 * Harmonic component of a signal
 */
export interface Harmonic {
  /** Harmonic order (1 = fundamental, 2 = 2nd harmonic, etc.) */
  order: number;

  /** Frequency in Hz */
  frequency: number;

  /** Amplitude (magnitude) */
  amplitude: number;

  /** Phase in radians */
  phase: number;

  /** Percentage of total signal energy */
  energyPercentage: number;
}

/**
 * Complete FFT analysis result
 */
export interface FFTAnalysisResult {
  /** Full frequency spectrum */
  spectrum: FrequencySpectrum;

  /** Detected peaks sorted by amplitude (descending) */
  peaks: FrequencyPeak[];

  /** Harmonic components (if fundamental detected) */
  harmonics: Harmonic[];

  /** Fundamental frequency in Hz (if detected) */
  fundamentalFrequency: number | null;

  /** Total Harmonic Distortion percentage (0-100) */
  thd: number;

  /** DC offset (0 Hz component) */
  dcOffset: number;

  /** Total signal energy */
  totalEnergy: number;

  /** Analysis timestamp */
  timestamp: number;
}

/**
 * FFT computation options
 */
export interface FFTOptions {
  /** FFT size (must be power of 2) */
  size: number;

  /** Window function to apply */
  windowFunction: WindowFunction;

  /** Sample rate in Hz */
  sampleRate: number;

  /** Whether to return phase information */
  includePhase: boolean;
}

/**
 * Window functions for FFT
 */
export type WindowFunction =
  | "none" // Rectangular window
  | "hann" // Hann window (recommended)
  | "hamming" // Hamming window
  | "blackman" // Blackman window
  | "bartlett"; // Bartlett (triangular) window

/**
 * Peak detection options
 */
export interface PeakDetectionOptions {
  /** Minimum amplitude threshold (0-1) */
  threshold: number;

  /** Minimum frequency in Hz (ignore below) */
  minFrequency: number;

  /** Maximum frequency in Hz (ignore above) */
  maxFrequency: number;

  /** Maximum number of peaks to return */
  maxPeaks: number;

  /** Minimum distance between peaks (in Hz) */
  minPeakDistance: number;
}

/**
 * Options for epicycle generation from FFT
 */
export interface EpicycleGenerationOptions {
  /** Maximum number of radii to generate */
  maxRadii: number;

  /** Minimum amplitude to include (0-1) */
  minAmplitude: number;

  /** Scale factor for radius lengths */
  scaleFactor: number;

  /** Sort radii by amplitude or frequency */
  sortBy: "amplitude" | "frequency";

  /** Include DC component (0 Hz) */
  includeDC: boolean;

  /** Normalize amplitudes to max length */
  normalizeToMaxLength: number | null;
}

/**
 * Spectrum analysis settings
 */
export interface SpectrumAnalysisSettings {
  /** FFT size */
  fftSize: 512 | 1024 | 2048 | 4096 | 8192;

  /** Window function */
  windowFunction: WindowFunction;

  /** Peak detection threshold (0-1) */
  peakThreshold: number;

  /** Show harmonic analysis */
  showHarmonics: boolean;

  /** Minimum frequency to display (Hz) */
  minFrequency: number;

  /** Maximum frequency to display (Hz) */
  maxFrequency: number;
}

/**
 * Signal reconstruction comparison metrics
 */
export interface ReconstructionMetrics {
  /** Mean Squared Error */
  mse: number;

  /** Root Mean Squared Error */
  rmse: number;

  /** Correlation coefficient (0-1) */
  correlation: number;

  /** Signal-to-Noise Ratio (dB) */
  snr: number;

  /** Percentage of signal energy captured */
  energyCaptured: number;

  /** Number of frequencies used */
  frequenciesUsed: number;
}
