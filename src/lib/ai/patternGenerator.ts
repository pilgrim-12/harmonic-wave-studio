import { pipeline, TextGenerationPipeline } from "@xenova/transformers";

// Pattern parameters for a single radius
export interface GeneratedRadius {
  frequency: number;
  amplitude: number;
  phase: number;
  color: string;
}

// Result of pattern generation
export interface GeneratedPattern {
  radii: GeneratedRadius[];
  name: string;
}

// Progress callback
export type ProgressCallback = (progress: {
  status: "loading" | "generating" | "done" | "error";
  message: string;
  progress?: number;
}) => void;

// Singleton generator instance
let generator: TextGenerationPipeline | null = null;
let isLoading = false;

// Color palette for generated patterns
const COLOR_PALETTE = [
  "#667eea", // indigo
  "#f093fb", // pink
  "#4facfe", // blue
  "#43e97b", // green
  "#fa709a", // rose
  "#fee140", // yellow
  "#30cfd0", // cyan
  "#ff9a9e", // coral
];

// Pre-defined pattern templates based on common descriptions
const PATTERN_TEMPLATES: Record<string, GeneratedRadius[]> = {
  // Flowers
  flower: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#667eea" },
    { frequency: 5, amplitude: 30, phase: 0, color: "#f093fb" },
  ],
  rose: [
    { frequency: 1, amplitude: 60, phase: 0, color: "#fa709a" },
    { frequency: 7, amplitude: 25, phase: Math.PI / 4, color: "#ff9a9e" },
    { frequency: -3, amplitude: 15, phase: 0, color: "#fbc2eb" },
  ],
  daisy: [
    { frequency: 1, amplitude: 40, phase: 0, color: "#fee140" },
    { frequency: 8, amplitude: 20, phase: 0, color: "#ffffff" },
  ],

  // Spirals
  spiral: [
    { frequency: 1, amplitude: 80, phase: 0, color: "#667eea" },
    { frequency: 0.1, amplitude: 20, phase: Math.PI / 2, color: "#4facfe" },
  ],
  galaxy: [
    { frequency: 1, amplitude: 70, phase: 0, color: "#667eea" },
    { frequency: 2, amplitude: 35, phase: Math.PI / 3, color: "#764ba2" },
    { frequency: -0.5, amplitude: 20, phase: 0, color: "#f093fb" },
  ],

  // Hearts
  heart: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#fa709a" },
    { frequency: 2, amplitude: 25, phase: Math.PI, color: "#ff9a9e" },
    { frequency: -3, amplitude: 15, phase: Math.PI / 2, color: "#fbc2eb" },
  ],

  // Geometric
  star: [
    { frequency: 1, amplitude: 60, phase: 0, color: "#fee140" },
    { frequency: 5, amplitude: 30, phase: 0, color: "#fbc2eb" },
  ],
  pentagon: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#4facfe" },
    { frequency: -4, amplitude: 25, phase: 0, color: "#30cfd0" },
  ],
  triangle: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#43e97b" },
    { frequency: -2, amplitude: 25, phase: 0, color: "#38f9d7" },
  ],
  square: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#667eea" },
    { frequency: -3, amplitude: 17, phase: 0, color: "#764ba2" },
    { frequency: 5, amplitude: 10, phase: 0, color: "#f093fb" },
  ],

  // Nature
  wave: [
    { frequency: 1, amplitude: 40, phase: 0, color: "#4facfe" },
    { frequency: 2, amplitude: 20, phase: Math.PI / 4, color: "#30cfd0" },
    { frequency: 3, amplitude: 10, phase: Math.PI / 2, color: "#a8edea" },
  ],
  leaf: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#43e97b" },
    { frequency: 2, amplitude: 25, phase: Math.PI / 6, color: "#38f9d7" },
  ],
  butterfly: [
    { frequency: 1, amplitude: 60, phase: 0, color: "#f093fb" },
    { frequency: 3, amplitude: 30, phase: Math.PI / 2, color: "#667eea" },
    { frequency: -2, amplitude: 20, phase: 0, color: "#fbc2eb" },
  ],

  // Abstract
  chaos: [
    { frequency: 1, amplitude: 40, phase: 0, color: "#ff9a9e" },
    { frequency: 2.7, amplitude: 30, phase: 1.2, color: "#fbc2eb" },
    { frequency: -3.3, amplitude: 25, phase: 0.8, color: "#667eea" },
    { frequency: 5.1, amplitude: 15, phase: 2.1, color: "#4facfe" },
  ],
  infinity: [
    { frequency: 1, amplitude: 60, phase: 0, color: "#667eea" },
    { frequency: 2, amplitude: 30, phase: Math.PI / 2, color: "#f093fb" },
  ],

  // Rhythmic
  heartbeat: [
    { frequency: 1, amplitude: 30, phase: 0, color: "#fa709a" },
    { frequency: 4, amplitude: 40, phase: 0, color: "#ff9a9e" },
    { frequency: 8, amplitude: 15, phase: Math.PI / 4, color: "#fbc2eb" },
  ],
  pulse: [
    { frequency: 1, amplitude: 50, phase: 0, color: "#30cfd0" },
    { frequency: 3, amplitude: 25, phase: 0, color: "#4facfe" },
    { frequency: 6, amplitude: 12, phase: 0, color: "#667eea" },
  ],
};

// Keywords mapping to templates
const KEYWORD_MAPPING: Record<string, string> = {
  // Flowers
  "цветок": "flower",
  "роза": "rose",
  "ромашка": "daisy",
  "flower": "flower",
  "rose": "rose",
  "daisy": "daisy",
  "лепест": "flower",
  "petal": "flower",

  // Spirals
  "спираль": "spiral",
  "галактик": "galaxy",
  "spiral": "spiral",
  "galaxy": "galaxy",

  // Hearts
  "сердц": "heart",
  "heart": "heart",
  "love": "heart",

  // Stars
  "звезд": "star",
  "star": "star",

  // Geometric
  "пятиуголь": "pentagon",
  "pentagon": "pentagon",
  "треугол": "triangle",
  "triangle": "triangle",
  "квадрат": "square",
  "square": "square",

  // Nature
  "волн": "wave",
  "wave": "wave",
  "ocean": "wave",
  "лист": "leaf",
  "leaf": "leaf",
  "бабочк": "butterfly",
  "butterfly": "butterfly",

  // Abstract
  "хаос": "chaos",
  "chaos": "chaos",
  "random": "chaos",
  "бесконеч": "infinity",
  "infinity": "infinity",

  // Rhythmic
  "сердцебиен": "heartbeat",
  "heartbeat": "heartbeat",
  "пульс": "pulse",
  "pulse": "pulse",
  "ритм": "pulse",
  "rhythm": "pulse",
};

/**
 * Find matching template based on text description
 */
function findMatchingTemplate(text: string): GeneratedRadius[] | null {
  const lowerText = text.toLowerCase();

  // Check for number patterns (e.g., "5 лепестков", "7 points")
  const numberMatch = lowerText.match(/(\d+)\s*(лепест|point|petal|ray|луч|конц)/);
  if (numberMatch) {
    const n = parseInt(numberMatch[1], 10);
    if (n >= 3 && n <= 12) {
      return [
        { frequency: 1, amplitude: 50, phase: 0, color: COLOR_PALETTE[0] },
        { frequency: n, amplitude: 25, phase: 0, color: COLOR_PALETTE[1] },
      ];
    }
  }

  // Check for star with specific points
  const starMatch = lowerText.match(/(\d+)[- ]?(point|pointed|конечн|лучев)/);
  if (starMatch) {
    const n = parseInt(starMatch[1], 10);
    if (n >= 3 && n <= 12) {
      return [
        { frequency: 1, amplitude: 60, phase: 0, color: "#fee140" },
        { frequency: n, amplitude: 30, phase: 0, color: "#fbc2eb" },
      ];
    }
  }

  // Check keywords
  for (const [keyword, templateName] of Object.entries(KEYWORD_MAPPING)) {
    if (lowerText.includes(keyword)) {
      return PATTERN_TEMPLATES[templateName] || null;
    }
  }

  return null;
}

/**
 * Generate pattern using template matching (fast, no AI)
 */
function generateFromTemplate(text: string): GeneratedPattern | null {
  const radii = findMatchingTemplate(text);
  if (radii) {
    return {
      radii,
      name: text.slice(0, 30),
    };
  }
  return null;
}

/**
 * Generate a random but pleasing pattern
 */
function generateRandomPattern(): GeneratedPattern {
  const numRadii = 2 + Math.floor(Math.random() * 3); // 2-4 radii
  const radii: GeneratedRadius[] = [];

  for (let i = 0; i < numRadii; i++) {
    const isNegative = Math.random() > 0.5;
    const freq = (1 + Math.floor(Math.random() * 7)) * (isNegative ? -1 : 1);

    radii.push({
      frequency: i === 0 ? 1 : freq, // First radius always freq=1
      amplitude: 60 - i * 15 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      color: COLOR_PALETTE[i % COLOR_PALETTE.length],
    });
  }

  return {
    radii,
    name: "Random Pattern",
  };
}

/**
 * Initialize the text generation model
 */
export async function initializeGenerator(
  onProgress?: ProgressCallback
): Promise<void> {
  if (generator || isLoading) return;

  isLoading = true;
  onProgress?.({
    status: "loading",
    message: "Loading AI model... (first time may take a minute)",
    progress: 0,
  });

  try {
    // Using a small, fast model
    generator = await pipeline(
      "text-generation",
      "Xenova/Qwen1.5-0.5B-Chat",
      {
        progress_callback: (progress: { progress?: number; status?: string }) => {
          if (progress.progress !== undefined) {
            onProgress?.({
              status: "loading",
              message: `Downloading model: ${Math.round(progress.progress)}%`,
              progress: progress.progress,
            });
          }
        },
      }
    );

    onProgress?.({
      status: "done",
      message: "Model loaded!",
      progress: 100,
    });
  } catch (error) {
    console.error("Failed to load AI model:", error);
    onProgress?.({
      status: "error",
      message: "Failed to load AI model. Using template matching instead.",
    });
  } finally {
    isLoading = false;
  }
}

/**
 * Generate pattern from text description
 */
export async function generatePattern(
  description: string,
  onProgress?: ProgressCallback
): Promise<GeneratedPattern> {
  onProgress?.({
    status: "generating",
    message: "Analyzing description...",
  });

  // First try template matching (fast)
  const templateResult = generateFromTemplate(description);
  if (templateResult) {
    onProgress?.({
      status: "done",
      message: "Pattern generated from template!",
    });
    return templateResult;
  }

  // If no template match and AI is not loaded, try to load it
  if (!generator && !isLoading) {
    await initializeGenerator(onProgress);
  }

  // If AI is available, use it
  if (generator) {
    onProgress?.({
      status: "generating",
      message: "AI is generating pattern...",
    });

    try {
      const prompt = `Generate harmonic wave parameters for: "${description}"
Return JSON only: {"radii":[{"frequency":1,"amplitude":50,"phase":0},{"frequency":3,"amplitude":25,"phase":0}]}
JSON:`;

      const result = await generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
      });

      // Try to parse JSON from response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultAny = result as any;
      const text = Array.isArray(resultAny)
        ? resultAny[0]?.generated_text
        : (resultAny?.generated_text || resultAny);
      const jsonMatch = String(text).match(/\{[\s\S]*"radii"[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.radii) && parsed.radii.length > 0) {
            // Add colors if missing
            const radii = parsed.radii.map((r: Partial<GeneratedRadius>, i: number) => ({
              frequency: r.frequency || 1,
              amplitude: Math.min(100, Math.max(5, r.amplitude || 30)),
              phase: r.phase || 0,
              color: r.color || COLOR_PALETTE[i % COLOR_PALETTE.length],
            }));

            onProgress?.({
              status: "done",
              message: "Pattern generated!",
            });

            return { radii, name: description.slice(0, 30) };
          }
        } catch (parseError) {
          console.warn("Failed to parse AI response:", parseError);
        }
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    }
  }

  // Fallback: generate random pattern
  onProgress?.({
    status: "done",
    message: "Generated random pattern",
  });

  return generateRandomPattern();
}

/**
 * Check if AI model is loaded
 */
export function isModelLoaded(): boolean {
  return generator !== null;
}

/**
 * Check if model is currently loading
 */
export function isModelLoading(): boolean {
  return isLoading;
}
