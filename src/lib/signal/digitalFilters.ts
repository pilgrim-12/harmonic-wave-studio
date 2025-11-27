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

/**
 * Design Chebyshev Type I filter (ripple in passband)
 * @param order Filter order
 * @param cutoffFreq Normalized cutoff frequency (0-0.5)
 * @param ripple Passband ripple in dB (typically 0.1 to 3 dB)
 * @param mode Filter mode (lowpass or highpass)
 */
export function designChebyshev1Filter(
  order: number,
  cutoffFreq: number,
  ripple: number = 0.5,
  mode: "lowpass" | "highpass" = "lowpass"
): FilterCoefficients {
  const epsilon = Math.sqrt(Math.pow(10, ripple / 10) - 1);
  const w0 = 2 * Math.PI * cutoffFreq;

  // Calculate pole positions
  const poles: Array<{ real: number; imag: number }> = [];
  const sinh_val = Math.asinh(1 / epsilon) / order;

  for (let k = 0; k < order; k++) {
    const theta = ((2 * k + 1) * Math.PI) / (2 * order);
    const real = -Math.sinh(sinh_val) * Math.sin(theta);
    const imag = Math.cosh(sinh_val) * Math.cos(theta);
    poles.push({ real, imag });
  }

  // Build cascaded biquad sections
  const numSections = Math.ceil(order / 2);
  let allA = [1];
  let allB = [1];

  for (let section = 0; section < numSections; section++) {
    let biquad: { b: number[]; a: number[] };

    if (section * 2 + 1 === order) {
      // Odd order - single real pole
      const pole = poles[section * 2];
      biquad = chebyshevFirstOrderBiquad(pole.real, w0, mode);
    } else {
      // Pair of complex conjugate poles
      const pole = poles[section * 2];
      biquad = chebyshevSecondOrderBiquad(pole, w0, mode);
    }

    allA = convolve(allA, biquad.a);
    allB = convolve(allB, biquad.b);
  }

  // Normalize gain for passband
  const gain = mode === "lowpass" ?
    (order % 2 === 0 ? 1 / Math.sqrt(1 + epsilon * epsilon) : 1) : 1;
  allB = allB.map(b => b * gain);

  return { a: allA, b: allB };
}

/**
 * Design Chebyshev Type II filter (ripple in stopband)
 * @param order Filter order
 * @param cutoffFreq Normalized cutoff frequency (0-0.5)
 * @param stopbandAtten Stopband attenuation in dB (typically 40-80 dB)
 * @param mode Filter mode (lowpass or highpass)
 */
export function designChebyshev2Filter(
  order: number,
  cutoffFreq: number,
  stopbandAtten: number = 40,
  mode: "lowpass" | "highpass" = "lowpass"
): FilterCoefficients {
  const epsilon = 1 / Math.sqrt(Math.pow(10, stopbandAtten / 10) - 1);
  const w0 = 2 * Math.PI * cutoffFreq;

  // Calculate zeros and poles
  const zeros: number[] = [];
  const poles: Array<{ real: number; imag: number }> = [];
  const sinh_val = Math.asinh(1 / epsilon) / order;

  for (let k = 0; k < order; k++) {
    const theta = ((2 * k + 1) * Math.PI) / (2 * order);

    // Zeros on imaginary axis
    zeros.push(1 / Math.cos(theta));

    // Poles (inverse of Type I)
    const sinh_theta = Math.sinh(sinh_val) * Math.sin(theta);
    const cosh_theta = Math.cosh(sinh_val) * Math.cos(theta);
    const denom = sinh_theta * sinh_theta + cosh_theta * cosh_theta;

    poles.push({
      real: -sinh_theta / denom,
      imag: cosh_theta / denom
    });
  }

  // Build cascaded biquad sections
  const numSections = Math.ceil(order / 2);
  let allA = [1];
  let allB = [1];

  for (let section = 0; section < numSections; section++) {
    let biquad: { b: number[]; a: number[] };

    if (section * 2 + 1 === order) {
      // Odd order
      const pole = poles[section * 2];
      biquad = chebyshevFirstOrderBiquad(pole.real, w0, mode);
    } else {
      // Even order with zeros
      const pole = poles[section * 2];
      const zero = zeros[section * 2];
      biquad = chebyshev2SecondOrderBiquad(pole, zero, w0, mode);
    }

    allA = convolve(allA, biquad.a);
    allB = convolve(allB, biquad.b);
  }

  return { a: allA, b: allB };
}

/**
 * Helper: First-order Chebyshev biquad
 */
function chebyshevFirstOrderBiquad(
  poleReal: number,
  w0: number,
  mode: "lowpass" | "highpass"
): { b: number[]; a: number[] } {
  const K = Math.tan(w0 / 2);
  const p = poleReal;

  if (mode === "lowpass") {
    const norm = K - p;
    return {
      b: [K / norm, K / norm],
      a: [1, (K + p) / norm]
    };
  } else {
    const norm = K - p;
    return {
      b: [1 / norm, -1 / norm],
      a: [1, (K + p) / norm]
    };
  }
}

/**
 * Helper: Second-order Chebyshev Type I biquad
 */
function chebyshevSecondOrderBiquad(
  pole: { real: number; imag: number },
  w0: number,
  mode: "lowpass" | "highpass"
): { b: number[]; a: number[] } {
  const K = Math.tan(w0 / 2);
  const pr = pole.real;
  const pi = Math.abs(pole.imag);

  const K2 = K * K;
  const pr2 = pr * pr;
  const pi2 = pi * pi;

  const norm = K2 - 2 * K * pr + pr2 + pi2;

  if (mode === "lowpass") {
    return {
      b: [K2 / norm, 2 * K2 / norm, K2 / norm],
      a: [1, 2 * (K2 - pr2 - pi2) / norm, (K2 + 2 * K * pr + pr2 + pi2) / norm]
    };
  } else {
    return {
      b: [1 / norm, -2 / norm, 1 / norm],
      a: [1, 2 * (K2 - pr2 - pi2) / norm, (K2 + 2 * K * pr + pr2 + pi2) / norm]
    };
  }
}

/**
 * Helper: Second-order Chebyshev Type II biquad (with zeros)
 */
function chebyshev2SecondOrderBiquad(
  pole: { real: number; imag: number },
  zero: number,
  w0: number,
  mode: "lowpass" | "highpass"
): { b: number[]; a: number[] } {
  const K = Math.tan(w0 / 2);
  const pr = pole.real;
  const pi = Math.abs(pole.imag);
  const zi = Math.abs(zero);

  const K2 = K * K;
  const normA = K2 - 2 * K * pr + pr * pr + pi * pi;

  if (mode === "lowpass") {
    const normB = K2 + zi * zi;
    return {
      b: [K2 / normB, 2 * K2 / normB, K2 / normB],
      a: [1, 2 * (K2 - pr * pr - pi * pi) / normA,
          (K2 + 2 * K * pr + pr * pr + pi * pi) / normA]
    };
  } else {
    const normB = K2 + zi * zi;
    return {
      b: [(K2 + zi * zi) / normB, -2 * zi * zi / normB, (K2 + zi * zi) / normB],
      a: [1, 2 * (K2 - pr * pr - pi * pi) / normA,
          (K2 + 2 * K * pr + pr * pr + pi * pi) / normA]
    };
  }
}

/**
 * Create band-pass filter by cascading lowpass and highpass
 * @param lowCutoff Lower cutoff frequency (normalized 0-0.5)
 * @param highCutoff Upper cutoff frequency (normalized 0-0.5)
 */
export function createBandPassFilter(
  filterType: "butterworth" | "chebyshev1" | "chebyshev2",
  order: number,
  lowCutoff: number,
  highCutoff: number,
  ripple: number = 0.5
): FilterCoefficients {
  // Create highpass at lowCutoff (removes low frequencies)
  let hpFilter: FilterCoefficients;
  // Create lowpass at highCutoff (removes high frequencies)
  let lpFilter: FilterCoefficients;

  if (filterType === "butterworth") {
    hpFilter = designButterworthFilter(order, lowCutoff, "highpass");
    lpFilter = designButterworthFilter(order, highCutoff, "lowpass");
  } else if (filterType === "chebyshev1") {
    hpFilter = designChebyshev1Filter(order, lowCutoff, ripple, "highpass");
    lpFilter = designChebyshev1Filter(order, highCutoff, ripple, "lowpass");
  } else {
    hpFilter = designChebyshev2Filter(order, lowCutoff, ripple, "highpass");
    lpFilter = designChebyshev2Filter(order, highCutoff, ripple, "lowpass");
  }

  // Cascade: convolve coefficients
  return {
    a: convolve(hpFilter.a, lpFilter.a),
    b: convolve(hpFilter.b, lpFilter.b),
  };
}

/**
 * Create band-stop (notch) filter by parallel combination
 * @param lowCutoff Lower cutoff frequency (normalized 0-0.5)
 * @param highCutoff Upper cutoff frequency (normalized 0-0.5)
 */
export function createBandStopFilter(
  filterType: "butterworth" | "chebyshev1" | "chebyshev2",
  order: number,
  lowCutoff: number,
  highCutoff: number,
  ripple: number = 0.5
): FilterCoefficients {
  // Create lowpass at lowCutoff (keeps low frequencies)
  let lpFilter: FilterCoefficients;
  // Create highpass at highCutoff (keeps high frequencies)
  let hpFilter: FilterCoefficients;

  if (filterType === "butterworth") {
    lpFilter = designButterworthFilter(order, lowCutoff, "lowpass");
    hpFilter = designButterworthFilter(order, highCutoff, "highpass");
  } else if (filterType === "chebyshev1") {
    lpFilter = designChebyshev1Filter(order, lowCutoff, ripple, "lowpass");
    hpFilter = designChebyshev1Filter(order, highCutoff, ripple, "highpass");
  } else {
    lpFilter = designChebyshev2Filter(order, lowCutoff, ripple, "lowpass");
    hpFilter = designChebyshev2Filter(order, highCutoff, ripple, "highpass");
  }

  // For band-stop, we add the outputs (parallel combination)
  // This is approximated by averaging coefficients
  const maxLenA = Math.max(lpFilter.a.length, hpFilter.a.length);
  const maxLenB = Math.max(lpFilter.b.length, hpFilter.b.length);

  const a = new Array(maxLenA).fill(0);
  const b = new Array(maxLenB).fill(0);

  for (let i = 0; i < lpFilter.a.length; i++) a[i] += lpFilter.a[i] / 2;
  for (let i = 0; i < hpFilter.a.length; i++) a[i] += hpFilter.a[i] / 2;
  for (let i = 0; i < lpFilter.b.length; i++) b[i] += lpFilter.b[i] / 2;
  for (let i = 0; i < hpFilter.b.length; i++) b[i] += hpFilter.b[i] / 2;

  return { a, b };
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
