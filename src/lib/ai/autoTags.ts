/**
 * Auto-tags generator for harmonic wave patterns
 * Analyzes radii parameters and generates descriptive tags
 */

interface RadiusParams {
  frequency: number;
  amplitude: number;
  phase: number;
}

/**
 * Generate tags based on pattern analysis
 */
export function generateAutoTags(radii: RadiusParams[]): string[] {
  const tags: string[] = [];

  if (radii.length === 0) return tags;

  // Basic info
  tags.push(`${radii.length} ${radii.length === 1 ? "radius" : "radii"}`);

  // Analyze frequencies
  const frequencies = radii.map((r) => Math.abs(r.frequency));
  const maxFreq = Math.max(...frequencies);
  const minFreq = Math.min(...frequencies);

  // Speed tags
  if (maxFreq <= 1) {
    tags.push("slow");
  } else if (maxFreq <= 3) {
    tags.push("moderate");
  } else if (maxFreq <= 7) {
    tags.push("fast");
  } else {
    tags.push("very fast");
  }

  // Symmetry detection
  const hasSymmetry = detectSymmetry(radii);
  if (hasSymmetry) {
    tags.push("symmetric");
  }

  // Pattern type detection
  const patternType = detectPatternType(radii);
  if (patternType) {
    tags.push(patternType);
  }

  // Petal/point count detection
  const petalCount = detectPetalCount(radii);
  if (petalCount > 0) {
    tags.push(`${petalCount} petals`);
  }

  // Complexity
  if (radii.length >= 4) {
    tags.push("complex");
  } else if (radii.length <= 2) {
    tags.push("simple");
  }

  // Direction analysis
  const hasClockwise = radii.some((r) => r.frequency < 0);
  const hasCounterClockwise = radii.some((r) => r.frequency > 0);
  if (hasClockwise && hasCounterClockwise) {
    tags.push("mixed rotation");
  }

  // Amplitude analysis
  const amplitudes = radii.map((r) => r.amplitude);
  const maxAmp = Math.max(...amplitudes);
  if (maxAmp >= 80) {
    tags.push("large");
  } else if (maxAmp <= 30) {
    tags.push("small");
  }

  // Harmonic relationships
  if (hasHarmonicRelationship(frequencies)) {
    tags.push("harmonic");
  }

  return tags.slice(0, 8); // Limit to 8 tags
}

/**
 * Detect if pattern has symmetry
 */
function detectSymmetry(radii: RadiusParams[]): boolean {
  if (radii.length < 2) return false;

  // Check if frequencies have integer relationships
  const frequencies = radii.map((r) => Math.abs(r.frequency));
  const baseFreq = frequencies[0];

  if (baseFreq === 0) return false;

  // Check if all frequencies are integer multiples of base
  return frequencies.every((f) => {
    const ratio = f / baseFreq;
    return Math.abs(ratio - Math.round(ratio)) < 0.1;
  });
}

/**
 * Detect pattern type based on parameters
 */
function detectPatternType(radii: RadiusParams[]): string | null {
  if (radii.length < 2) return null;

  const frequencies = radii.map((r) => r.frequency);
  const absFreqs = frequencies.map((f) => Math.abs(f));

  // Flower pattern: freq1=1, freq2=n where n>2
  if (
    radii.length >= 2 &&
    Math.abs(frequencies[0]) === 1 &&
    absFreqs[1] >= 3 &&
    absFreqs[1] <= 12
  ) {
    return "flower";
  }

  // Spiral pattern: very low frequency component
  if (absFreqs.some((f) => f > 0 && f < 0.5)) {
    return "spiral";
  }

  // Star pattern: freq1=1, freq2=-n (opposite direction)
  if (
    radii.length >= 2 &&
    frequencies[0] > 0 &&
    frequencies[1] < 0 &&
    Math.abs(frequencies[1]) >= 2
  ) {
    return "star";
  }

  // Wave pattern: similar frequencies
  if (absFreqs.every((f) => Math.abs(f - absFreqs[0]) < 1)) {
    return "wave";
  }

  return null;
}

/**
 * Detect number of petals/points in pattern
 */
function detectPetalCount(radii: RadiusParams[]): number {
  if (radii.length < 2) return 0;

  // For flower patterns, petals = |freq2 - freq1| or |freq2 + freq1|
  const f1 = Math.abs(radii[0].frequency);
  const f2 = Math.abs(radii[1].frequency);

  if (f1 === 1 && f2 >= 3 && f2 <= 12) {
    // Check if second radius rotates opposite direction
    if (radii[0].frequency * radii[1].frequency < 0) {
      return Math.abs(f2 - f1);
    } else {
      return Math.abs(f2 + f1);
    }
  }

  return 0;
}

/**
 * Check if frequencies have harmonic relationships (1:2:3:4 etc)
 */
function hasHarmonicRelationship(frequencies: number[]): boolean {
  if (frequencies.length < 2) return false;

  const sorted = [...frequencies].sort((a, b) => a - b);
  const base = sorted[0];

  if (base === 0) return false;

  // Check for simple integer ratios
  let harmonicCount = 0;
  for (let i = 1; i < sorted.length; i++) {
    const ratio = sorted[i] / base;
    if (Number.isInteger(ratio) && ratio <= 8) {
      harmonicCount++;
    }
  }

  return harmonicCount >= sorted.length - 1;
}

/**
 * Suggest tags based on user's existing tags
 */
export function suggestTags(
  radii: RadiusParams[],
  existingTags: string[]
): string[] {
  const autoTags = generateAutoTags(radii);

  // Filter out tags that already exist (case-insensitive)
  const existingLower = existingTags.map((t) => t.toLowerCase());
  return autoTags.filter((tag) => !existingLower.includes(tag.toLowerCase()));
}
