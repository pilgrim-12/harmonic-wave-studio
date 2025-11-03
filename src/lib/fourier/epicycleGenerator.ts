/**
 * Epicycle Generator from FFT
 * Converts frequency spectrum analysis into radius parameters
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
  minAmplitude: 0.05, // 5% of max
  scaleFactor: 50, // Scale amplitude to pixel length
  sortBy: "amplitude",
  includeDC: false,
  normalizeToMaxLength: 150, // Max radius length in pixels
};

/**
 * Generate radius parameters from FFT analysis
 * This is the MAGIC function that converts spectrum → epicycles! ✨
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
 */
function peakToRadius(
  peak: FrequencyPeak,
  fundamentalFreq: number,
  options: EpicycleGenerationOptions
): CreateRadiusParams {
  // Calculate rotation speed
  // Use absolute frequency directly, don't divide by fundamental
  // This gives reasonable speeds (e.g., 1 Hz = 1.0 rev/s)
  const rotationSpeed = peak.frequency;

  // Clamp rotation speed to reasonable range [0.1, 10]
  const clampedSpeed = Math.max(0.1, Math.min(rotationSpeed, 10));

  // Calculate radius length from amplitude
  let length = peak.amplitude * options.scaleFactor;

  // Normalize to max length if specified
  if (options.normalizeToMaxLength !== null) {
    const maxAmplitude = peak.relativeAmplitude; // Already normalized 0-1
    length = maxAmplitude * options.normalizeToMaxLength;
  }

  // Ensure minimum length
  length = Math.max(length, 10);

  // Initial angle from phase
  // Convert phase from radians to degrees for easier editing
  const initialAngle = peak.phase; // Keep in radians for calculation

  // Determine direction based on rotation speed
  // Positive frequencies → counterclockwise
  // Negative frequencies → clockwise (though we filtered negatives in FFT)
  const direction: "clockwise" | "counterclockwise" =
    clampedSpeed >= 0 ? "counterclockwise" : "clockwise";

  // Generate color based on frequency (rainbow spectrum)
  const color = frequencyToColor(peak.frequency, fundamentalFreq);

  // Parent is previous radius (linear chain)
  // First radius has no parent, others will be linked in sequence by caller
  const parentId = null;

  return {
    parentId,
    name: `${peak.frequency.toFixed(2)} Hz`,
    length: Math.round(length),
    initialAngle,
    rotationSpeed: Math.abs(clampedSpeed), // Use clamped speed
    direction,
    color,
  };
}

/**
 * Convert frequency to color (rainbow spectrum)
 * Lower frequencies → red/orange
 * Higher frequencies → blue/purple
 */
function frequencyToColor(frequency: number, fundamentalFreq: number): string {
  // Normalize frequency relative to fundamental
  const ratio = frequency / fundamentalFreq;

  // Map to hue (0-360)
  // ratio 1 (fundamental) → hue 240 (blue)
  // ratio 2 → hue 200 (cyan)
  // ratio 3 → hue 160 (green)
  // ratio 5 → hue 100 (yellow-green)
  // ratio 7 → hue 40 (orange)

  let hue: number;

  if (ratio <= 1) {
    // Fundamental: blue-purple
    hue = 240 + (1 - ratio) * 60; // 240-300
  } else if (ratio <= 3) {
    // 2nd-3rd harmonics: cyan-green
    hue = 240 - ((ratio - 1) / 2) * 80; // 240-160
  } else if (ratio <= 5) {
    // 4th-5th harmonics: green-yellow
    hue = 160 - ((ratio - 3) / 2) * 60; // 160-100
  } else {
    // Higher harmonics: yellow-red
    hue = 100 - ((ratio - 5) / 5) * 60; // 100-40
    hue = Math.max(hue, 0);
  }

  // HSL color with good saturation and lightness
  return `hsl(${Math.round(hue)}, 70%, 60%)`;
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

  // Limit to reasonable range
  return Math.min(Math.max(count, 3), 15);
}

/**
 * Preview what radii will be generated without creating them
 * Useful for UI preview
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
    selectedFreqs.includes(peak.frequency)
  );

  const capturedEnergy = selectedPeaks.reduce(
    (sum, peak) => sum + peak.amplitude * peak.amplitude,
    0
  );

  const capturedPercentage = (capturedEnergy / totalEnergy) * 100;

  return {
    count: radiiParams.length,
    totalEnergy,
    capturedEnergy,
    capturedPercentage,
    frequencies: selectedFreqs,
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
