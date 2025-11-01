// Simplified type for preset data - only essential fields
export interface PresetRadiusData {
  length: number;
  initialAngle: number;
  rotationSpeed: number;
  direction: "clockwise" | "counterclockwise";
  color: string;
}

export interface WaveformPreset {
  id: string;
  name: string;
  description: string;
  category: "basic" | "advanced" | "educational";
  radii: PresetRadiusData[];
}

export const WAVEFORM_PRESETS: WaveformPreset[] = [
  {
    id: "sine",
    name: "Sine Wave",
    description: "Pure sine wave - the simplest periodic signal",
    category: "basic",
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
    radii: [
      {
        length: 50,
        initialAngle: 0,
        rotationSpeed: 1.0,
        direction: "counterclockwise",
        color: "#667eea",
      },
      {
        length: 17,
        initialAngle: 0,
        rotationSpeed: 3.0,
        direction: "counterclockwise",
        color: "#764ba2",
      },
      {
        length: 10,
        initialAngle: 0,
        rotationSpeed: 5.0,
        direction: "counterclockwise",
        color: "#f093fb",
      },
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
];
