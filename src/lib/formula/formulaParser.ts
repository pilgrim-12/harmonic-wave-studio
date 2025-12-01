/**
 * Fourier Formula Parser
 *
 * Parses mathematical formulas and converts them to radius configurations.
 * Supports various input formats:
 *
 * 1. Simple terms: "sin(2t)", "3*sin(t)", "2*sin(3t + 45)"
 * 2. Multiple terms: "sin(t) + 0.5*sin(2t) + 0.33*sin(3t)"
 * 3. Cosine terms: "cos(t)" (converted to sin with phase shift)
 * 4. Negative amplitudes: "-0.5*sin(2t)" (reversed direction)
 * 5. Preset formulas: "square", "sawtooth", "triangle"
 */

import { PresetRadiusData } from "@/lib/presets/waveforms";

// Color palette for generated radii
const COLORS = [
  "#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe",
  "#43e97b", "#fa709a", "#fee140", "#30cfd0", "#c471ed",
];

export interface ParsedTerm {
  amplitude: number;      // Coefficient (radius length)
  frequency: number;      // Multiplier of t
  phase: number;          // Phase offset in degrees
  direction: "clockwise" | "counterclockwise";
}

export interface ParseResult {
  success: boolean;
  terms: ParsedTerm[];
  error?: string;
  originalFormula: string;
}

/**
 * Main parser function
 */
export function parseFormula(formula: string): ParseResult {
  const originalFormula = formula.trim();

  if (!originalFormula) {
    return { success: false, terms: [], error: "Empty formula", originalFormula };
  }

  // Check for preset shortcuts
  const presetTerms = checkPresetShortcut(originalFormula.toLowerCase());
  if (presetTerms) {
    return { success: true, terms: presetTerms, originalFormula };
  }

  try {
    const terms = parseTerms(originalFormula);

    if (terms.length === 0) {
      return {
        success: false,
        terms: [],
        error: "No valid terms found. Use format: A*sin(n*t + phase)",
        originalFormula
      };
    }

    return { success: true, terms, originalFormula };
  } catch (e) {
    return {
      success: false,
      terms: [],
      error: e instanceof Error ? e.message : "Parse error",
      originalFormula
    };
  }
}

/**
 * Check for preset shortcuts like "square", "sawtooth", "triangle"
 */
function checkPresetShortcut(formula: string): ParsedTerm[] | null {
  // Square wave: odd harmonics with 1/n amplitude
  if (formula === "square" || formula === "square wave") {
    return [
      { amplitude: 50, frequency: 1, phase: 0, direction: "counterclockwise" },
      { amplitude: 17, frequency: 3, phase: 0, direction: "counterclockwise" },
      { amplitude: 10, frequency: 5, phase: 0, direction: "counterclockwise" },
      { amplitude: 7, frequency: 7, phase: 0, direction: "counterclockwise" },
      { amplitude: 5.5, frequency: 9, phase: 0, direction: "counterclockwise" },
    ];
  }

  // Sawtooth wave: all harmonics with alternating direction
  if (formula === "sawtooth" || formula === "saw") {
    return [
      { amplitude: 50, frequency: 1, phase: 0, direction: "counterclockwise" },
      { amplitude: 25, frequency: 2, phase: 0, direction: "clockwise" },
      { amplitude: 17, frequency: 3, phase: 0, direction: "counterclockwise" },
      { amplitude: 13, frequency: 4, phase: 0, direction: "clockwise" },
      { amplitude: 10, frequency: 5, phase: 0, direction: "counterclockwise" },
    ];
  }

  // Triangle wave: odd harmonics with 1/n² amplitude and alternating phase
  if (formula === "triangle" || formula === "tri") {
    return [
      { amplitude: 50, frequency: 1, phase: 0, direction: "counterclockwise" },
      { amplitude: 6, frequency: 3, phase: 180, direction: "counterclockwise" },
      { amplitude: 2, frequency: 5, phase: 0, direction: "counterclockwise" },
      { amplitude: 1, frequency: 7, phase: 180, direction: "counterclockwise" },
    ];
  }

  return null;
}

/**
 * Parse individual terms from formula
 */
function parseTerms(formula: string): ParsedTerm[] {
  const terms: ParsedTerm[] = [];

  // Normalize the formula
  let normalized = formula
    .replace(/\s+/g, "")           // Remove spaces
    .replace(/×/g, "*")            // Replace × with *
    .replace(/·/g, "*")            // Replace · with *
    .replace(/−/g, "-")            // Replace em-dash with minus
    .replace(/π/g, "pi")           // Replace π with pi
    .replace(/\*t\b/g, "*1*t")     // "2*t" -> "2*1*t" for consistency
    .replace(/^t\b/, "1*t")        // "t" at start -> "1*t"
    .replace(/\(t\b/g, "(1*t");    // "(t" -> "(1*t"

  // Split by + or - while keeping the sign
  // Match: optional sign, then everything until next +/- at term boundary
  const termRegex = /([+-]?)([^+-]+)/g;
  let match;

  while ((match = termRegex.exec(normalized)) !== null) {
    const sign = match[1] === "-" ? -1 : 1;
    const termStr = match[2].trim();

    if (!termStr) continue;

    const parsed = parseSingleTerm(termStr, sign);
    if (parsed) {
      terms.push(parsed);
    }
  }

  return terms;
}

/**
 * Parse a single term like "3*sin(2*t+45)" or "cos(t)"
 */
function parseSingleTerm(term: string, sign: number): ParsedTerm | null {
  // Match patterns:
  // - A*sin(n*t+phase)
  // - A*sin(nt+phase)
  // - sin(t)
  // - A*cos(...)

  // More flexible regex for sin/cos terms
  const sinCosRegex = /^(\d*\.?\d*)?\*?(sin|cos)\((\d*\.?\d*)?\*?t(?:([+-])(\d+\.?\d*))?\)$/i;

  const match = term.match(sinCosRegex);
  if (!match) {
    // Try simpler patterns
    return parseSimpleTerm(term, sign);
  }

  const [, ampStr, func, freqStr, phaseSign, phaseStr] = match;

  let amplitude = ampStr ? parseFloat(ampStr) : 1;
  const frequency = freqStr ? parseFloat(freqStr) : 1;
  let phase = phaseStr ? parseFloat(phaseStr) : 0;

  // Handle phase sign
  if (phaseSign === "-") {
    phase = -phase;
  }

  // Convert cos to sin by adding 90° phase
  if (func.toLowerCase() === "cos") {
    phase += 90;
  }

  // Apply sign to amplitude
  amplitude *= sign;

  // Determine direction based on final amplitude sign
  const direction: "clockwise" | "counterclockwise" =
    amplitude >= 0 ? "counterclockwise" : "clockwise";

  // Scale amplitude to pixels (reasonable default)
  const scaledAmplitude = Math.abs(amplitude) * 50;

  return {
    amplitude: Math.max(1, Math.round(scaledAmplitude)),
    frequency: Math.abs(frequency),
    phase: ((phase % 360) + 360) % 360, // Normalize to 0-360
    direction,
  };
}

/**
 * Try to parse simpler term formats
 */
function parseSimpleTerm(term: string, sign: number): ParsedTerm | null {
  // Just a number (DC offset - skip)
  if (/^\d+\.?\d*$/.test(term)) {
    return null;
  }

  // Try format: A*sin(nωt) or similar with omega
  const omegaRegex = /^(\d*\.?\d*)?\*?(sin|cos)\((\d*\.?\d*)?\*?[ωw]?\*?t\)$/i;
  const omegaMatch = term.match(omegaRegex);

  if (omegaMatch) {
    const [, ampStr, func, freqStr] = omegaMatch;
    let amplitude = (ampStr ? parseFloat(ampStr) : 1) * sign;
    const frequency = freqStr ? parseFloat(freqStr) : 1;
    let phase = func.toLowerCase() === "cos" ? 90 : 0;

    const direction: "clockwise" | "counterclockwise" =
      amplitude >= 0 ? "counterclockwise" : "clockwise";

    return {
      amplitude: Math.max(1, Math.round(Math.abs(amplitude) * 50)),
      frequency: Math.abs(frequency),
      phase,
      direction,
    };
  }

  return null;
}

/**
 * Convert parsed terms to radius data for the app
 */
export function termsToRadii(terms: ParsedTerm[]): PresetRadiusData[] {
  return terms.map((term, index) => ({
    length: term.amplitude,
    initialAngle: term.phase,
    rotationSpeed: term.frequency,
    direction: term.direction,
    color: COLORS[index % COLORS.length],
  }));
}

/**
 * Generate example formulas for UI hints
 */
export const FORMULA_EXAMPLES = [
  { formula: "sin(t)", description: "Simple sine wave" },
  { formula: "sin(t) + 0.5*sin(2t)", description: "Two harmonics" },
  { formula: "sin(t) + 0.33*sin(3t) + 0.2*sin(5t)", description: "Odd harmonics" },
  { formula: "cos(t) + sin(2t)", description: "Cosine + sine" },
  { formula: "square", description: "Square wave preset" },
  { formula: "sawtooth", description: "Sawtooth wave preset" },
  { formula: "triangle", description: "Triangle wave preset" },
];

/**
 * Validate formula syntax without parsing
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula.trim()) {
    return { valid: false, error: "Formula cannot be empty" };
  }

  // Check for basic valid characters
  const validChars = /^[0-9a-zA-Z\s+\-*/().πωt]+$/;
  if (!validChars.test(formula)) {
    return { valid: false, error: "Invalid characters in formula" };
  }

  // Check balanced parentheses
  let depth = 0;
  for (const char of formula) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (depth < 0) return { valid: false, error: "Unbalanced parentheses" };
  }
  if (depth !== 0) return { valid: false, error: "Unbalanced parentheses" };

  return { valid: true };
}
