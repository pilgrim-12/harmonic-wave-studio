/**
 * Digital Filters Library - SIMPLE BUT CORRECT
 * Using cascaded 2nd-order sections (biquads)
 */

export interface FilterCoefficients {
  a: number[];
  b: number[];
}

/**
 * Design Butterworth filter using cascaded biquads
 * This is THE STANDARD method used in all DSP libraries
 */
export function designButterworthFilter(
  order: number,
  cutoffFreq: number,
  mode: "lowpass" | "highpass" = "lowpass"
): FilterCoefficients {
  const w0 = 2 * Math.PI * cutoffFreq;

  // For orders > 2, cascade multiple 2nd-order sections
  const numSections = Math.ceil(order / 2);
  let allA = [1];
  let allB = mode === "lowpass" ? [1] : [1];

  for (let section = 0; section < numSections; section++) {
    const sectionOrder = section === numSections - 1 && order % 2 === 1 ? 1 : 2;

    let biquad: { b: number[]; a: number[] };

    if (sectionOrder === 1) {
      // First-order section (only for odd orders)
      biquad = getFirstOrderBiquad(w0, mode);
    } else {
      // Second-order section
      const poleAngle = ((2 * section + 1) * Math.PI) / (2 * order);
      const Q = 1 / (2 * Math.cos(poleAngle));
      biquad = getSecondOrderBiquad(w0, Q, mode);
    }

    // Cascade: multiply polynomials
    allA = convolve(allA, biquad.a);
    allB = convolve(allB, biquad.b);
  }

  return { a: allA, b: allB };
}

/**
 * First-order biquad (for odd-order filters)
 */
function getFirstOrderBiquad(
  w0: number,
  mode: "lowpass" | "highpass"
): { b: number[]; a: number[] } {
  const K = Math.tan(w0 / 2);

  if (mode === "lowpass") {
    const norm = 1 + K;
    return {
      b: [K / norm, K / norm],
      a: [1, (K - 1) / norm],
    };
  } else {
    const norm = 1 + K;
    return {
      b: [1 / norm, -1 / norm],
      a: [1, (K - 1) / norm],
    };
  }
}

/**
 * Second-order biquad using standard Audio EQ Cookbook formulas
 * These formulas are PROVEN and used everywhere
 */
function getSecondOrderBiquad(
  w0: number,
  Q: number,
  mode: "lowpass" | "highpass"
): { b: number[]; a: number[] } {
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  if (mode === "lowpass") {
    const b0 = (1 - cosW0) / 2;
    const b1 = 1 - cosW0;
    const b2 = (1 - cosW0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosW0;
    const a2 = 1 - alpha;

    return {
      b: [b0 / a0, b1 / a0, b2 / a0],
      a: [1, a1 / a0, a2 / a0],
    };
  } else {
    // Highpass
    const b0 = (1 + cosW0) / 2;
    const b1 = -(1 + cosW0);
    const b2 = (1 + cosW0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosW0;
    const a2 = 1 - alpha;

    return {
      b: [b0 / a0, b1 / a0, b2 / a0],
      a: [1, a1 / a0, a2 / a0],
    };
  }
}

/**
 * Convolve two arrays (polynomial multiplication)
 */
function convolve(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }

  return result;
}

/**
 * Apply filter using Direct Form II Transposed
 * THIS IS THE GOLD STANDARD - most numerically stable
 */
export function applyFilter(
  signal: number[],
  coefficients: FilterCoefficients
): number[] {
  const { a, b } = coefficients;
  const filtered: number[] = [];

  // Ensure a[0] = 1 (normalize if needed)
  const a0 = a[0];
  const aNorm = a.map((val) => val / a0);
  const bNorm = b.map((val) => val / a0);

  // State variables for Direct Form II Transposed
  const order = Math.max(aNorm.length, bNorm.length) - 1;
  const z = new Array(order).fill(0);

  for (let n = 0; n < signal.length; n++) {
    const x = signal[n];

    // Output calculation
    const y = bNorm[0] * x + z[0];

    // Update delay line
    for (let i = 0; i < order - 1; i++) {
      z[i] = bNorm[i + 1] * x - aNorm[i + 1] * y + z[i + 1];
    }
    z[order - 1] = bNorm[order] * x - aNorm[order] * y;

    filtered.push(y);
  }

  return filtered;
}

/**
 * Calculate frequency response
 */
export function getFrequencyResponse(
  coefficients: FilterCoefficients,
  frequencies: number[]
): { magnitude: number[]; phase: number[] } {
  const { a, b } = coefficients;
  const magnitude: number[] = [];
  const phase: number[] = [];

  for (const f of frequencies) {
    const omega = 2 * Math.PI * f;

    let B_real = 0,
      B_imag = 0;
    let A_real = 0,
      A_imag = 0;

    for (let k = 0; k < b.length; k++) {
      B_real += b[k] * Math.cos(-omega * k);
      B_imag += b[k] * Math.sin(-omega * k);
    }

    for (let k = 0; k < a.length; k++) {
      A_real += a[k] * Math.cos(-omega * k);
      A_imag += a[k] * Math.sin(-omega * k);
    }

    const denom = A_real ** 2 + A_imag ** 2;
    const H_real = (B_real * A_real + B_imag * A_imag) / denom;
    const H_imag = (B_imag * A_real - B_real * A_imag) / denom;

    const mag = 20 * Math.log10(Math.sqrt(H_real ** 2 + H_imag ** 2));
    magnitude.push(mag);

    const ph = (Math.atan2(H_imag, H_real) * 180) / Math.PI;
    phase.push(ph);
  }

  return { magnitude, phase };
}

export function generateFrequencyArray(
  numPoints: number = 512,
  nyquist: number = 0.5
): number[] {
  const freqs: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    freqs.push((i / numPoints) * nyquist);
  }
  return freqs;
}
