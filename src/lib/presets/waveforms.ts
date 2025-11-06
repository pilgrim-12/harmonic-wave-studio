/**
 * Waveform Presets with Mathematical Explanations
 * NOW WITH 11 PRESETS! (6 original + 5 new)
 *
 * This file contains preset configurations for common waveforms.
 * Each preset is based on Fourier series decomposition or musical theory.
 */

// Simplified type for preset data - only essential fields
export interface PresetRadiusData {
  length: number; // Amplitude (radius length in pixels)
  initialAngle: number; // Phase offset (in degrees, 0-360)
  rotationSpeed: number; // Frequency multiplier (rev/s)
  direction: "clockwise" | "counterclockwise";
  color: string;
}

export interface WaveformPreset {
  id: string;
  name: string;
  description: string;
  category: "basic" | "advanced" | "educational";
  radii: PresetRadiusData[];
  mathExplanation?: string;
}

export const WAVEFORM_PRESETS: WaveformPreset[] = [
  // =========================================
  // BASIC WAVEFORMS (6 original)
  // =========================================

  {
    id: "sine",
    name: "Sine Wave",
    description: "Pure sine wave - the simplest periodic signal",
    category: "basic",
    mathExplanation: "f(t) = A·sin(ωt) - Single frequency component",
    radii: [
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
    ],
  },

  {
    id: "square",
    name: "Square Wave",
    description: "Square wave - odd harmonics (1, 3, 5, 7...)",
    category: "basic",
    mathExplanation:
      "f(t) = (4/π)·[sin(ωt) + (1/3)sin(3ωt) + (1/5)sin(5ωt) + ...]",
    radii: [
      // Fundamental (1st harmonic): amplitude = (4/π) ≈ 1.273
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },

      // 3rd harmonic: amplitude = (4/π) * (1/3) ≈ 0.424
      {
        length: 17,
        initialAngle: 0,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },

      // 5th harmonic: amplitude = (4/π) * (1/5) ≈ 0.255
      {
        length: 10,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },

      // 7th harmonic: amplitude = (4/π) * (1/7) ≈ 0.182
      {
        length: 7,
        initialAngle: 0,
        rotationSpeed: 7.0,
        direction: "counterclockwise",
        color: "#4facfe",
      },
    ],
  },

  {
    id: "sawtooth",
    name: "Sawtooth Wave",
    description: "Sawtooth wave - all harmonics (1, 2, 3, 4...)",
    category: "basic",
    mathExplanation:
      "f(t) = (2/π)·[sin(ωt) - (1/2)sin(2ωt) + (1/3)sin(3ωt) - ...]",
    radii: [
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 25,
        initialAngle: 0,
        rotationSpeed: 2.0,
        direction: "clockwise",
        color: "#764ba2",
      },
      {
        length: 17,
        initialAngle: 0,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },
      {
        length: 13,
        initialAngle: 0,
        rotationSpeed: 4.0,
        direction: "clockwise",
        color: "#4facfe",
      },
    ],
  },

  {
    id: "triangle",
    name: "Triangle Wave",
    description: "Triangle wave - odd harmonics with alternating phase",
    category: "basic",
    mathExplanation:
      "f(t) = (8/π²)·[sin(ωt) - (1/9)sin(3ωt) + (1/25)sin(5ωt) - ...]",
    radii: [
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 6,
        initialAngle: 180,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },
      {
        length: 2,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },
    ],
  },

  {
    id: "complex",
    name: "Complex Pattern",
    description: "Complex harmonic pattern with multiple frequencies",
    category: "advanced",
    mathExplanation: "f(t) = sum of multiple harmonics at different phases",
    radii: [
      {
        length: 40,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 20,
        initialAngle: 90,
        rotationSpeed: 2.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },
      {
        length: 15,
        initialAngle: 45,
        rotationSpeed: 3.0,
        direction: "clockwise",
        color: "#f093fb",
      },
      {
        length: 10,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#4facfe",
      },
      {
        length: 8,
        initialAngle: 180,
        rotationSpeed: 7.0,
        direction: "clockwise",
        color: "#00f2fe",
      },
    ],
  },

  {
    id: "beating",
    name: "Beating Frequencies",
    description: "Two close frequencies creating beats",
    category: "educational",
    mathExplanation: "f(t) = sin(ω₁t) + sin(ω₂t) where ω₂ ≈ ω₁",
    radii: [
      {
        length: 40,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 40,
        initialAngle: 0,
        rotationSpeed: 1.1,
        direction: "counterclockwise",
        color: "#764ba2",
      },
    ],
  },

  // =========================================
  // ✨ NEW PRESETS (5 additions)
  // =========================================

  {
    id: "harmonic-series",
    name: "🎓 Harmonic Series",
    description:
      "Pure overtone series (1x, 2x, 3x, 4x, 5x) - fundamental + harmonics",
    category: "educational",
    mathExplanation: "f(t) = Σ (1/n)·sin(n·ωt) for n=1,2,3,4,5",
    radii: [
      // Fundamental: full amplitude
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },

      // 2nd harmonic: 1/2 amplitude
      {
        length: 25,
        initialAngle: 0,
        rotationSpeed: 2.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },

      // 3rd harmonic: 1/3 amplitude
      {
        length: 17,
        initialAngle: 0,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },

      // 4th harmonic: 1/4 amplitude
      {
        length: 13,
        initialAngle: 0,
        rotationSpeed: 4.0,
        direction: "counterclockwise",
        color: "#4facfe",
      },

      // 5th harmonic: 1/5 amplitude
      {
        length: 10,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#00f2fe",
      },
    ],
  },

  {
    id: "pulse",
    name: "🎮 Pulse Wave",
    description: "Asymmetric square wave (25% duty cycle) - retro game sound!",
    category: "advanced",
    mathExplanation: "Square wave with 25% duty cycle - creates hollow sound",
    radii: [
      // Creates asymmetric waveform using phase-shifted harmonics
      {
        length: 40,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 20,
        initialAngle: 90,
        rotationSpeed: 2.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },
      {
        length: 13,
        initialAngle: 0,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },
      {
        length: 10,
        initialAngle: 90,
        rotationSpeed: 4.0,
        direction: "counterclockwise",
        color: "#4facfe",
      },
      {
        length: 8,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#00f2fe",
      },
    ],
  },

  {
    id: "chord",
    name: "🎵 Major Chord",
    description: "C-E-G major triad - three frequencies in musical harmony",
    category: "advanced",
    mathExplanation:
      "f(t) = sin(ωt) + sin(1.25ωt) + sin(1.5ωt) - C:E:G = 1:1.25:1.5",
    radii: [
      // C note (fundamental)
      {
        length: 40,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },

      // E note (major third = 5/4 ratio)
      {
        length: 40,
        initialAngle: 120,
        rotationSpeed: 1.25,
        direction: "counterclockwise",
        color: "#f093fb",
      },

      // G note (perfect fifth = 3/2 ratio)
      {
        length: 40,
        initialAngle: 240,
        rotationSpeed: 1.5,
        direction: "counterclockwise",
        color: "#00f2fe",
      },
    ],
  },

  {
    id: "am-modulation",
    name: "📡 AM Modulation",
    description: "Amplitude modulation - slow wave modulates fast carrier",
    category: "advanced",
    mathExplanation: "f(t) = [1 + m·sin(ωₘt)]·sin(ωct) - carrier × modulator",
    radii: [
      // High frequency carrier
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#667eea",
      },

      // Low frequency modulator (creates amplitude envelope)
      {
        length: 25,
        initialAngle: 0,
        rotationSpeed: 0.5,
        direction: "counterclockwise",
        color: "#f093fb",
      },
    ],
  },

  {
    id: "wobble",
    name: "🔊 Wobble Bass",
    description: "Dubstep-style wobble - LFO modulating main signal",
    category: "advanced",
    mathExplanation: "Low frequency oscillation (LFO) modulating audio signal",
    radii: [
      // Main bass frequency
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 2.0,
        direction: "counterclockwise",
        color: "#667eea",
      },

      // Slow wobble (LFO - Low Frequency Oscillator)
      {
        length: 30,
        initialAngle: 0,
        rotationSpeed: 0.2,
        direction: "counterclockwise",
        color: "#f093fb",
      },

      // Upper harmonic for brightness
      {
        length: 20,
        initialAngle: 90,
        rotationSpeed: 4.0,
        direction: "counterclockwise",
        color: "#4facfe",
      },
    ],
  },
];

/**
 * Helper: Get preset by ID
 */
export function getPresetById(id: string): WaveformPreset | undefined {
  return WAVEFORM_PRESETS.find((preset) => preset.id === id);
}

/**
 * Helper: Get presets by category
 */
export function getPresetsByCategory(
  category: "basic" | "advanced" | "educational"
): WaveformPreset[] {
  return WAVEFORM_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Helper: Calculate expected waveform type from radii configuration
 * Returns "square", "sawtooth", "triangle", "sine", or "custom"
 */
export function detectWaveformType(radii: PresetRadiusData[]): string {
  if (radii.length === 1) return "sine";

  // Check for square wave pattern (odd harmonics only, same phase)
  const isSquare = radii.every((r, i) => {
    if (i === 0) return true;
    const expectedSpeed = 2 * i + 1;
    return r.rotationSpeed === expectedSpeed && r.initialAngle === 0;
  });
  if (isSquare) return "square";

  // Check for sawtooth (alternating direction)
  const isSawtooth = radii.every((r, i) => {
    if (i === 0) return true;
    const prevDirection = radii[i - 1].direction;
    return r.direction !== prevDirection;
  });
  if (isSawtooth) return "sawtooth";

  // Check for triangle (odd harmonics with phase shifts)
  const hasPhaseShifts = radii.some((r) => r.initialAngle === 180);
  const hasOnlyOddHarmonics = radii.every((r) => r.rotationSpeed % 2 === 1);
  if (hasPhaseShifts && hasOnlyOddHarmonics) return "triangle";

  return "custom";
}

/**
 * Helper: Get all preset names for UI dropdown
 */
export function getAllPresetNames(): string[] {
  return WAVEFORM_PRESETS.map((preset) => preset.name);
}

/**
 * Helper: Count presets by category
 */
export function countPresetsByCategory(): Record<string, number> {
  return {
    basic: getPresetsByCategory("basic").length,
    advanced: getPresetsByCategory("advanced").length,
    educational: getPresetsByCategory("educational").length,
    total: WAVEFORM_PRESETS.length,
  };
}
