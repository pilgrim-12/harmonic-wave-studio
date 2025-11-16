import { QualityMetrics } from "@/types/signal";

/**
 * Calculate Mean Square Error
 */
export function calculateMSE(signal1: number[], signal2: number[]): number {
  const length = Math.min(signal1.length, signal2.length);
  let sum = 0;

  for (let i = 0; i < length; i++) {
    const diff = signal1[i] - signal2[i];
    sum += diff * diff;
  }

  return sum / length;
}

/**
 * Calculate Root Mean Square Error
 */
export function calculateRMSE(signal1: number[], signal2: number[]): number {
  return Math.sqrt(calculateMSE(signal1, signal2));
}

/**
 * Calculate Signal-to-Noise Ratio
 */
export function calculateSNR(signal: number[], noise: number[]): number {
  const signalPower =
    signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
  const noisePower =
    noise.reduce((sum, val) => sum + val * val, 0) / noise.length;

  if (noisePower === 0) return Infinity;
  return 10 * Math.log10(signalPower / noisePower);
}

/**
 * Calculate Peak Signal-to-Noise Ratio
 */
export function calculatePSNR(original: number[], distorted: number[]): number {
  const maxValue = Math.max(...original.map(Math.abs));
  const mse = calculateMSE(original, distorted);

  if (mse === 0) return Infinity;
  return 20 * Math.log10(maxValue) - 10 * Math.log10(mse);
}

/**
 * Calculate correlation coefficient
 */
export function calculateCorrelation(
  signal1: number[],
  signal2: number[]
): number {
  const length = Math.min(signal1.length, signal2.length);

  const mean1 = signal1.reduce((sum, val) => sum + val, 0) / length;
  const mean2 = signal2.reduce((sum, val) => sum + val, 0) / length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < length; i++) {
    const diff1 = signal1[i] - mean1;
    const diff2 = signal2[i] - mean2;

    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate all quality metrics
 */
export function calculateQualityMetrics(
  original: number[],
  distorted: number[]
): QualityMetrics {
  const diff = original.map((val, i) => val - (distorted[i] || 0));

  return {
    snr: calculateSNR(original, diff),
    mse: calculateMSE(original, distorted),
    psnr: calculatePSNR(original, distorted),
    correlation: calculateCorrelation(original, distorted),
    rmse: calculateRMSE(original, distorted),
  };
}
