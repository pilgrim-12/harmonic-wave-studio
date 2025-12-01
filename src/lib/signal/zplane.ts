/**
 * Z-Plane Analysis Library
 * Poles and Zeros visualization for digital filters
 *
 * The Z-plane is the complex plane where:
 * - The unit circle (|z| = 1) represents the frequency response
 * - Poles (×) determine filter stability and resonance
 * - Zeros (○) determine where frequencies are attenuated
 * - All poles must be inside unit circle for stability
 */

import { FilterCoefficients } from "./digitalFilters";

export interface Complex {
  real: number;
  imag: number;
}

export interface ZPlaneData {
  poles: Complex[];
  zeros: Complex[];
  gain: number;
  isStable: boolean;
  stabilityMargin: number; // Distance of closest pole to unit circle
}

export interface ZPlaneMetrics {
  numPoles: number;
  numZeros: number;
  isStable: boolean;
  stabilityMargin: number;
  dominantPoleFreq: number | null; // Frequency of dominant pole
  dominantPoleQ: number | null;     // Q factor of dominant pole
  dcGain: number;
  nyquistGain: number;
}

/**
 * Calculate poles and zeros from filter coefficients
 * For a transfer function H(z) = B(z)/A(z)
 * - Zeros are roots of B(z)
 * - Poles are roots of A(z)
 */
export function calculatePolesZeros(coefficients: FilterCoefficients): ZPlaneData {
  const { a, b } = coefficients;

  // Find roots of numerator polynomial (zeros)
  const zeros = findPolynomialRoots(b);

  // Find roots of denominator polynomial (poles)
  const poles = findPolynomialRoots(a);

  // Calculate gain (b[0] / a[0])
  const gain = b[0] / (a[0] || 1);

  // Check stability - all poles must be inside unit circle
  let isStable = true;
  let minDistToCircle = Infinity;

  for (const pole of poles) {
    const magnitude = Math.sqrt(pole.real ** 2 + pole.imag ** 2);
    const distToCircle = 1 - magnitude;

    if (magnitude >= 1) {
      isStable = false;
    }

    if (distToCircle < minDistToCircle) {
      minDistToCircle = distToCircle;
    }
  }

  return {
    poles,
    zeros,
    gain,
    isStable,
    stabilityMargin: minDistToCircle,
  };
}

/**
 * Find roots of a polynomial using companion matrix eigenvalues
 * For polynomial: c[0] + c[1]*z + c[2]*z^2 + ... + c[n]*z^n
 */
function findPolynomialRoots(coefficients: number[]): Complex[] {
  // Remove leading zeros and normalize
  let coeffs = [...coefficients];
  while (coeffs.length > 1 && Math.abs(coeffs[coeffs.length - 1]) < 1e-10) {
    coeffs.pop();
  }

  const n = coeffs.length - 1;
  if (n <= 0) return [];
  if (n === 1) {
    // Linear: c[0] + c[1]*z = 0 => z = -c[0]/c[1]
    return [{ real: -coeffs[0] / coeffs[1], imag: 0 }];
  }

  // Normalize by leading coefficient
  const lead = coeffs[n];
  coeffs = coeffs.map(c => c / lead);

  // For quadratic, use analytical formula
  if (n === 2) {
    return solveQuadratic(coeffs[0], coeffs[1], 1);
  }

  // For higher orders, use Durand-Kerner method
  return durandKernerRoots(coeffs);
}

/**
 * Solve quadratic equation az^2 + bz + c = 0
 */
function solveQuadratic(c: number, b: number, a: number): Complex[] {
  const discriminant = b * b - 4 * a * c;

  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    return [
      { real: (-b + sqrtD) / (2 * a), imag: 0 },
      { real: (-b - sqrtD) / (2 * a), imag: 0 },
    ];
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    return [
      { real: realPart, imag: imagPart },
      { real: realPart, imag: -imagPart },
    ];
  }
}

/**
 * Durand-Kerner method for finding all roots of a polynomial
 * More stable than companion matrix for higher-order polynomials
 */
function durandKernerRoots(coeffs: number[], maxIterations: number = 100): Complex[] {
  const n = coeffs.length - 1;
  if (n <= 0) return [];

  // Initial guesses: points on a circle with radius based on coefficients
  const radius = 1 + Math.max(...coeffs.map(Math.abs));
  const roots: Complex[] = [];

  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n + 0.1; // Offset to avoid symmetry issues
    roots.push({
      real: radius * Math.cos(angle) * 0.9,
      imag: radius * Math.sin(angle) * 0.9,
    });
  }

  // Iterate
  for (let iter = 0; iter < maxIterations; iter++) {
    let maxChange = 0;

    for (let i = 0; i < n; i++) {
      // Evaluate polynomial at roots[i]
      const pVal = evaluatePolynomial(coeffs, roots[i]);

      // Calculate product of (roots[i] - roots[j]) for j != i
      let prodReal = 1, prodImag = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const diffReal = roots[i].real - roots[j].real;
          const diffImag = roots[i].imag - roots[j].imag;

          // Complex multiplication
          const newReal = prodReal * diffReal - prodImag * diffImag;
          const newImag = prodReal * diffImag + prodImag * diffReal;
          prodReal = newReal;
          prodImag = newImag;
        }
      }

      // Divide p(roots[i]) by product
      const denom = prodReal * prodReal + prodImag * prodImag;
      if (denom > 1e-20) {
        const deltaReal = (pVal.real * prodReal + pVal.imag * prodImag) / denom;
        const deltaImag = (pVal.imag * prodReal - pVal.real * prodImag) / denom;

        roots[i].real -= deltaReal;
        roots[i].imag -= deltaImag;

        const change = Math.sqrt(deltaReal ** 2 + deltaImag ** 2);
        if (change > maxChange) maxChange = change;
      }
    }

    // Check convergence
    if (maxChange < 1e-10) break;
  }

  // Clean up very small imaginary parts (numerical noise)
  for (const root of roots) {
    if (Math.abs(root.imag) < 1e-8) {
      root.imag = 0;
    }
  }

  return roots;
}

/**
 * Evaluate polynomial at a complex point
 */
function evaluatePolynomial(coeffs: number[], z: Complex): Complex {
  let result = { real: 0, imag: 0 };
  let zPower = { real: 1, imag: 0 };

  for (let i = 0; i < coeffs.length; i++) {
    result.real += coeffs[i] * zPower.real;
    result.imag += coeffs[i] * zPower.imag;

    // z^(i+1) = z^i * z
    const newReal = zPower.real * z.real - zPower.imag * z.imag;
    const newImag = zPower.real * z.imag + zPower.imag * z.real;
    zPower.real = newReal;
    zPower.imag = newImag;
  }

  return result;
}

/**
 * Calculate Z-plane metrics
 */
export function calculateZPlaneMetrics(
  zplaneData: ZPlaneData,
  sampleRate: number
): ZPlaneMetrics {
  const { poles, zeros, isStable, stabilityMargin } = zplaneData;

  // Find dominant pole (closest to unit circle with significant Q)
  let dominantPole: Complex | null = null;
  let minDist = Infinity;

  for (const pole of poles) {
    const mag = Math.sqrt(pole.real ** 2 + pole.imag ** 2);
    const dist = Math.abs(1 - mag);

    // Only consider poles with imaginary part (resonant)
    if (Math.abs(pole.imag) > 0.01 && dist < minDist) {
      minDist = dist;
      dominantPole = pole;
    }
  }

  let dominantPoleFreq: number | null = null;
  let dominantPoleQ: number | null = null;

  if (dominantPole) {
    // Frequency from angle on unit circle
    const angle = Math.atan2(dominantPole.imag, dominantPole.real);
    dominantPoleFreq = (Math.abs(angle) / (2 * Math.PI)) * sampleRate;

    // Q factor approximation
    const mag = Math.sqrt(dominantPole.real ** 2 + dominantPole.imag ** 2);
    if (mag > 0.1) {
      dominantPoleQ = Math.PI * mag / (2 * (1 - mag));
    }
  }

  // Calculate DC gain (at z = 1)
  const dcGain = evaluateTransferFunction(zplaneData, { real: 1, imag: 0 });

  // Calculate Nyquist gain (at z = -1)
  const nyquistGain = evaluateTransferFunction(zplaneData, { real: -1, imag: 0 });

  return {
    numPoles: poles.length,
    numZeros: zeros.length,
    isStable,
    stabilityMargin,
    dominantPoleFreq,
    dominantPoleQ,
    dcGain: 20 * Math.log10(Math.abs(dcGain) + 1e-10),
    nyquistGain: 20 * Math.log10(Math.abs(nyquistGain) + 1e-10),
  };
}

/**
 * Evaluate transfer function magnitude at a point on unit circle
 */
function evaluateTransferFunction(zplaneData: ZPlaneData, z: Complex): number {
  const { poles, zeros, gain } = zplaneData;

  let numReal = 1, numImag = 0;
  let denReal = 1, denImag = 0;

  // Product of (z - zero_i)
  for (const zero of zeros) {
    const diffReal = z.real - zero.real;
    const diffImag = z.imag - zero.imag;

    const newReal = numReal * diffReal - numImag * diffImag;
    const newImag = numReal * diffImag + numImag * diffReal;
    numReal = newReal;
    numImag = newImag;
  }

  // Product of (z - pole_i)
  for (const pole of poles) {
    const diffReal = z.real - pole.real;
    const diffImag = z.imag - pole.imag;

    const newReal = denReal * diffReal - denImag * diffImag;
    const newImag = denReal * diffImag + denImag * diffReal;
    denReal = newReal;
    denImag = newImag;
  }

  const numMag = Math.sqrt(numReal ** 2 + numImag ** 2);
  const denMag = Math.sqrt(denReal ** 2 + denImag ** 2);

  return (gain * numMag) / (denMag + 1e-10);
}

/**
 * Get frequency response from poles and zeros
 */
export function getFrequencyResponseFromPZ(
  zplaneData: ZPlaneData,
  numPoints: number = 256
): { frequencies: number[]; magnitude: number[]; phase: number[] } {
  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const phase: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const normalizedFreq = i / (numPoints * 2); // 0 to 0.5 (Nyquist)
    const omega = 2 * Math.PI * normalizedFreq;

    // Point on unit circle
    const z: Complex = {
      real: Math.cos(omega),
      imag: Math.sin(omega),
    };

    // Evaluate H(z)
    const { magnitude: mag, phase: ph } = evaluateTransferFunctionComplex(zplaneData, z);

    frequencies.push(normalizedFreq);
    magnitude.push(20 * Math.log10(mag + 1e-10));
    phase.push(ph * (180 / Math.PI));
  }

  return { frequencies, magnitude, phase };
}

/**
 * Evaluate transfer function returning complex result
 */
function evaluateTransferFunctionComplex(
  zplaneData: ZPlaneData,
  z: Complex
): { magnitude: number; phase: number } {
  const { poles, zeros, gain } = zplaneData;

  let numReal = gain, numImag = 0;
  let denReal = 1, denImag = 0;

  // Product of (z - zero_i)
  for (const zero of zeros) {
    const diffReal = z.real - zero.real;
    const diffImag = z.imag - zero.imag;

    const newReal = numReal * diffReal - numImag * diffImag;
    const newImag = numReal * diffImag + numImag * diffReal;
    numReal = newReal;
    numImag = newImag;
  }

  // Product of (z - pole_i)
  for (const pole of poles) {
    const diffReal = z.real - pole.real;
    const diffImag = z.imag - pole.imag;

    const newReal = denReal * diffReal - denImag * diffImag;
    const newImag = denReal * diffImag + denImag * diffReal;
    denReal = newReal;
    denImag = newImag;
  }

  // Complex division: num / den
  const denMagSq = denReal ** 2 + denImag ** 2 + 1e-20;
  const hReal = (numReal * denReal + numImag * denImag) / denMagSq;
  const hImag = (numImag * denReal - numReal * denImag) / denMagSq;

  const magnitude = Math.sqrt(hReal ** 2 + hImag ** 2);
  const phase = Math.atan2(hImag, hReal);

  return { magnitude, phase };
}

/**
 * Get points on unit circle for visualization
 */
export function getUnitCirclePoints(numPoints: number = 100): Complex[] {
  const points: Complex[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    points.push({
      real: Math.cos(angle),
      imag: Math.sin(angle),
    });
  }

  return points;
}

/**
 * Calculate pole/zero from frequency and Q
 * Useful for understanding filter design
 */
export function poleFromFreqQ(
  normalizedFreq: number,
  Q: number
): { pole: Complex; conjugate: Complex } {
  const angle = 2 * Math.PI * normalizedFreq;

  // Radius from Q: r = 1 - π/(2Q) approximately
  const r = Math.exp(-Math.PI * normalizedFreq / Q);

  const pole: Complex = {
    real: r * Math.cos(angle),
    imag: r * Math.sin(angle),
  };

  const conjugate: Complex = {
    real: r * Math.cos(angle),
    imag: -r * Math.sin(angle),
  };

  return { pole, conjugate };
}

/**
 * Get stability region description
 */
export function getStabilityDescription(stabilityMargin: number): string {
  if (stabilityMargin < 0) {
    return "Unstable - poles outside unit circle";
  } else if (stabilityMargin < 0.01) {
    return "Marginally stable - poles very close to unit circle";
  } else if (stabilityMargin < 0.1) {
    return "Stable with low margin - may ring or oscillate";
  } else if (stabilityMargin < 0.3) {
    return "Stable - moderate damping";
  } else {
    return "Highly stable - well damped";
  }
}
