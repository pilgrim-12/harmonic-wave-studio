/**
 * Epicycle Generator from FFT - FIXED VERSION
 * Converts frequency spectrum analysis into radius parameters
 *
 * FIXES:
 * 1. ✅ Normalize angles to [0, 2π] range (no negative angles)
 * 2. ✅ Better rotation speed scaling (map Hz to reasonable UI speeds)
 * 3. ✅ Consistent length scaling
 * 4. ✅ Better color mapping
 */

import {
  FFTAnalysisResult,
  FrequencyPeak,
  EpicycleGenerationOptions,
} from "@/types/fourier";
import { CreateRadiusParams } from "@/types/radius";

/**
 * Default epicycle generation options
 */
const DEFAULT_GENERATION_OPTIONS: EpicycleGenerationOptions = {
  maxRadii: 10,
  minAmplitude: 0.05, // 5% of max amplitude
  scaleFactor: 50, // Scale amplitude to pixel length
  sortBy: "amplitude",
  includeDC: false,
  normalizeToMaxLength: 150, // Max radius length in pixels
};

/**
 * Generate radius parameters from FFT analysis
 * This converts frequency spectrum → epicycles! ✨
 *
 * @param analysisResult - FFT analysis result
 * @param options - Generation options
 * @returns Array of radius parameters ready to create
 */
export function generateRadiiFromFFT(
  analysisResult: FFTAnalysisResult,
  options: Partial<EpicycleGenerationOptions> = {}
): CreateRadiusParams[] {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };

  // Get peaks to work with
  let peaks = [...analysisResult.peaks];

  // Filter out DC component if not wanted
  if (!opts.includeDC) {
    peaks = peaks.filter((peak) => peak.frequency > 0.1);
  }

  // Filter by minimum amplitude
  const maxAmplitude = Math.max(...peaks.map((p) => p.amplitude));
  if (maxAmplitude === 0) return []; // No valid peaks

  const minAbsoluteAmplitude = maxAmplitude * opts.minAmplitude;
  peaks = peaks.filter((peak) => peak.amplitude >= minAbsoluteAmplitude);

  // Sort peaks
  if (opts.sortBy === "amplitude") {
    peaks.sort((a, b) => b.amplitude - a.amplitude);
  } else {
    peaks.sort((a, b) => a.frequency - b.frequency);
  }

  // Take top N peaks
  peaks = peaks.slice(0, opts.maxRadii);

  // Find fundamental frequency for normalization
  const fundamentalFreq =
    analysisResult.fundamentalFrequency || peaks[0]?.frequency || 1;

  // Convert peaks to radius parameters
  const radiiParams: CreateRadiusParams[] = peaks.map((peak) => {
    return peakToRadius(peak, fundamentalFreq, opts);
  });

  return radiiParams;
}

/**
 * Convert a single frequency peak to radius parameters
 *
 * KEY IMPROVEMENTS:
 * - ✅ Normalize angles to [0, 2π]
 * - ✅ Scale rotation speed intelligently
 * - ✅ Clamp all values to UI-friendly ranges
 */
function peakToRadius(
  peak: FrequencyPeak,
  fundamentalFreq: number,
  options: EpicycleGenerationOptions
): CreateRadiusParams {
  // ============================================
  // 1. ROTATION SPEED (Hz → rev/s)
  // ============================================

  // Strategy: Scale frequencies to reasonable UI speeds [0.1, 5.0]
  // - Fundamental frequency → ~1.0 rev/s
  // - Harmonics scale proportionally but clamped

  const frequencyRatio = peak.frequency / fundamentalFreq;

  // Map frequency ratio to rotation speed
  // Example: If fundamental = 0.5 Hz
  //   - 0.5 Hz (1x) → 1.0 rev/s
  //   - 1.0 Hz (2x) → 2.0 rev/s
  //   - 1.5 Hz (3x) → 3.0 rev/s
  let rotationSpeed = frequencyRatio;

  // Clamp to reasonable UI range [0.1, 5.0]
  // This ensures all speeds are user-editable and visible
  rotationSpeed = Math.max(0.1, Math.min(rotationSpeed, 5.0));

  // Round to 1 decimal place for cleaner UI
  rotationSpeed = Math.round(rotationSpeed * 10) / 10;

  // ============================================
  // 2. LENGTH (amplitude → pixels)
  // ============================================

  let length: number;

  if (options.normalizeToMaxLength !== null) {
    // Normalize based on relative amplitude (0-1)
    // This ensures largest peak = maxLength
    length = peak.relativeAmplitude * options.normalizeToMaxLength;
  } else {
    // Use absolute amplitude with scale factor
    length = peak.amplitude * options.scaleFactor;
  }

  // Clamp to reasonable range [10, 200] pixels
  length = Math.max(10, Math.min(length, 200));

  // Round to integer for pixel-perfect rendering
  length = Math.round(length);

  // ============================================
  // 3. INITIAL ANGLE (phase → [0, 2π])
  // ============================================

  // FFT returns phase in range [-π, +π]
  // We need to normalize to [0, 2π] for UI consistency

  let initialAngle = peak.phase;

  // Normalize to [0, 2π] range
  if (initialAngle < 0) {
    initialAngle += 2 * Math.PI;
  }

  // Ensure it's in valid range (handle edge cases)
  initialAngle = initialAngle % (2 * Math.PI);
  if (initialAngle < 0) initialAngle += 2 * Math.PI;

  // Round to 2 decimal places to avoid floating point issues
  initialAngle = Math.round(initialAngle * 100) / 100;

  // ============================================
  // 4. DIRECTION
  // ============================================

  // For FFT-generated epicycles, use counterclockwise
  // (FFT assumes positive frequency = counterclockwise rotation)
  const direction: "clockwise" | "counterclockwise" = "counterclockwise";

  // ============================================
  // 5. COLOR (frequency → rainbow)
  // ============================================

  const color = frequencyToColor(peak.frequency, fundamentalFreq);

  // ============================================
  // 6. NAME (frequency label)
  // ============================================

  const name = `${peak.frequency.toFixed(2)} Hz`;

  return {
    parentId: null, // Will be set by caller when chaining
    name,
    length,
    initialAngle,
    rotationSpeed,
    direction,
    color,
  };
}

/**
 * Convert frequency to color (rainbow spectrum)
 *
 * Color mapping:
 * - Low frequencies (fundamental) → Blue/Purple (240-280°)
 * - Mid frequencies (2x-3x) → Cyan/Green (180-120°)
 * - High frequencies (5x+) → Yellow/Orange (60-0°)
 */
function frequencyToColor(frequency: number, fundamentalFreq: number): string {
  // Normalize frequency relative to fundamental
  const ratio = frequency / fundamentalFreq;

  let hue: number;

  if (ratio <= 1) {
    // Fundamental: blue-purple (240-280°)
    hue = 240 + (1 - ratio) * 40;
  } else if (ratio <= 2) {
    // 2nd harmonic: blue-cyan (240-200°)
    hue = 240 - ((ratio - 1) / 1) * 40;
  } else if (ratio <= 3) {
    // 3rd harmonic: cyan-green (200-160°)
    hue = 200 - ((ratio - 2) / 1) * 40;
  } else if (ratio <= 5) {
    // 4th-5th harmonics: green-yellow (160-60°)
    hue = 160 - ((ratio - 3) / 2) * 100;
  } else {
    // Higher harmonics: yellow-orange (60-0°)
    hue = Math.max(0, 60 - ((ratio - 5) / 5) * 60);
  }

  // Clamp hue to valid range [0, 360]
  hue = Math.max(0, Math.min(360, hue));
  hue = Math.round(hue);

  // Return HSL color with good saturation and lightness
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Estimate optimal number of radii for a signal
 * Based on signal complexity and energy distribution
 */
export function estimateOptimalRadiiCount(
  analysisResult: FFTAnalysisResult
): number {
  const { peaks } = analysisResult;

  if (peaks.length === 0) {
    return 0;
  }

  // Calculate energy distribution
  const totalEnergy = peaks.reduce(
    (sum, peak) => sum + peak.amplitude * peak.amplitude,
    0
  );

  let cumulativeEnergy = 0;
  let count = 0;

  // Count how many peaks needed to capture 95% of energy
  for (const peak of peaks) {
    const energy = peak.amplitude * peak.amplitude;
    cumulativeEnergy += energy;
    count++;

    if (cumulativeEnergy / totalEnergy >= 0.95) {
      break;
    }
  }

  // Limit to reasonable range [3, 15]
  return Math.min(Math.max(count, 3), 15);
}

/**
 * Preview what radii will be generated without creating them
 * Useful for UI preview in settings dialog
 */
export function previewRadiiGeneration(
  analysisResult: FFTAnalysisResult,
  options: Partial<EpicycleGenerationOptions> = {}
): {
  count: number;
  totalEnergy: number;
  capturedEnergy: number;
  capturedPercentage: number;
  frequencies: number[];
  avgRotationSpeed: number;
  maxLength: number;
} {
  const radiiParams = generateRadiiFromFFT(analysisResult, options);

  // Calculate energy metrics
  const allPeaks = analysisResult.peaks;
  const totalEnergy = allPeaks.reduce(
    (sum, peak) => sum + peak.amplitude * peak.amplitude,
    0
  );

  const selectedFreqs = radiiParams.map((r) => parseFloat(r.name || "0"));
  const selectedPeaks = allPeaks.filter((peak) =>
    selectedFreqs.some((freq) => Math.abs(peak.frequency - freq) < 0.01)
  );

  const capturedEnergy = selectedPeaks.reduce(
    (sum, peak) => sum + peak.amplitude * peak.amplitude,
    0
  );

  const capturedPercentage =
    totalEnergy > 0 ? (capturedEnergy / totalEnergy) * 100 : 0;

  // Calculate average rotation speed
  const avgRotationSpeed =
    radiiParams.length > 0
      ? radiiParams.reduce((sum, r) => sum + (r.rotationSpeed || 0), 0) /
        radiiParams.length
      : 0;

  // Find max length
  const maxLength =
    radiiParams.length > 0
      ? Math.max(...radiiParams.map((r) => r.length || 0))
      : 0;

  return {
    count: radiiParams.length,
    totalEnergy,
    capturedEnergy,
    capturedPercentage,
    frequencies: selectedFreqs,
    avgRotationSpeed: Math.round(avgRotationSpeed * 10) / 10,
    maxLength,
  };
}

/**
 * Generate radii optimized for visual appeal
 * Ensures good spacing and visible radii
 */
export function generateVisualOptimizedRadii(
  analysisResult: FFTAnalysisResult
): CreateRadiusParams[] {
  return generateRadiiFromFFT(analysisResult, {
    maxRadii: 8, // Sweet spot for visualization
    minAmplitude: 0.1, // Only significant peaks
    scaleFactor: 60,
    sortBy: "amplitude", // Most important first
    includeDC: false,
    normalizeToMaxLength: 120, // Good visible size
  });
}

/**
 * Generate radii optimized for accuracy
 * Captures maximum signal information
 */
export function generateAccuracyOptimizedRadii(
  analysisResult: FFTAnalysisResult
): CreateRadiusParams[] {
  const optimalCount = estimateOptimalRadiiCount(analysisResult);

  return generateRadiiFromFFT(analysisResult, {
    maxRadii: optimalCount,
    minAmplitude: 0.02, // Include more components
    scaleFactor: 50,
    sortBy: "amplitude",
    includeDC: true, // Include DC for accuracy
    normalizeToMaxLength: null, // Use actual amplitudes
  });
}
