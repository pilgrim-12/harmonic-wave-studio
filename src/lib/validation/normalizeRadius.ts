/**
 * Normalize radius values to ensure they are within valid ranges
 */

export interface NormalizeableRadius {
  initialAngle: number;
  rotationSpeed: number;
  length: number;
}

export interface NormalizedRadius extends NormalizeableRadius {
  currentAngle?: number;
}

/**
 * Normalize a single radius to valid ranges:
 * - Angles: [0, 2π)
 * - Speed: [0.1, 10]
 * - Length: [5, 200]
 */
export function normalizeRadius<T extends NormalizeableRadius>(
  radius: T
): T & { currentAngle?: number } {
  // Normalize angle to [0, 2π)
  let angle = radius.initialAngle % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;

  // Clamp speed to [0.1, 10]
  const speed = Math.max(0.1, Math.min(Math.abs(radius.rotationSpeed), 10));

  // Clamp length to [5, 200]
  const length = Math.max(5, Math.min(radius.length, 200));

  return {
    ...radius,
    initialAngle: angle,
    currentAngle: angle,
    rotationSpeed: speed,
    length,
  };
}

/**
 * Normalize an array of radii
 */
export function normalizeRadii<T extends NormalizeableRadius>(
  radii: T[]
): Array<T & { currentAngle?: number }> {
  return radii.map(normalizeRadius);
}

/**
 * Check if a radius needs normalization
 */
export function needsNormalization(radius: NormalizeableRadius): boolean {
  const angle = radius.initialAngle % (2 * Math.PI);
  const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

  const needsAngleNormalization = normalizedAngle !== radius.initialAngle;
  const needsSpeedNormalization =
    radius.rotationSpeed < 0.1 || radius.rotationSpeed > 10;
  const needsLengthNormalization = radius.length < 5 || radius.length > 200;

  return (
    needsAngleNormalization ||
    needsSpeedNormalization ||
    needsLengthNormalization
  );
}

/**
 * Count how many radii need normalization
 */
export function countInvalidRadii(radii: NormalizeableRadius[]): number {
  return radii.filter(needsNormalization).length;
}
