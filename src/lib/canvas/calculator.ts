import { Radius, Point2D, RadiusPosition, EnvelopeConfig } from "@/types/radius";

/**
 * Calculate envelope value at a given time
 * Returns a multiplier between 0 and 1
 */
export function calculateEnvelopeValue(
  envelope: EnvelopeConfig,
  time: number
): number {
  if (!envelope.enabled) return 1;

  const { attack, decay, sustain, release, curve, loop, loopDuration } = envelope;
  const totalDuration = attack + decay + release;

  // Handle looping
  let t = time;
  if (loop && loopDuration && loopDuration > 0) {
    t = time % loopDuration;
  }

  // Calculate which phase we're in
  let value: number;

  if (t < attack) {
    // Attack phase: 0 -> 1
    const progress = t / attack;
    value = curve === "exponential"
      ? Math.pow(progress, 2) // Exponential curve
      : progress; // Linear
  } else if (t < attack + decay) {
    // Decay phase: 1 -> sustain
    const progress = (t - attack) / decay;
    const decayAmount = 1 - sustain;
    value = curve === "exponential"
      ? 1 - decayAmount * Math.pow(progress, 0.5) // Fast initial decay
      : 1 - decayAmount * progress; // Linear
  } else if (loop || t < attack + decay + release) {
    // Sustain phase (infinite if looping, otherwise until release)
    if (loop) {
      value = sustain;
    } else {
      // Release phase: sustain -> 0
      const releaseStart = attack + decay;
      const progress = (t - releaseStart) / release;
      value = curve === "exponential"
        ? sustain * Math.pow(1 - Math.min(progress, 1), 2)
        : sustain * (1 - Math.min(progress, 1));
    }
  } else {
    // After release: 0
    value = 0;
  }

  return Math.max(0, Math.min(1, value));
}

/**
 * Вычисляет позиции всех радиусов в цепочке
 */
export function calculateRadiusPositions(
  radii: Radius[],
  centerX: number,
  centerY: number,
  currentTime: number
): RadiusPosition[] {
  const positions: RadiusPosition[] = [];

  // Сортируем радиусы по порядку (корневой первый)
  const sortedRadii = [...radii].sort((a, b) => a.order - b.order);

  // Карта для быстрого поиска позиции конца родительского радиуса
  const endPointMap = new Map<string | null, Point2D>();
  endPointMap.set(null, { x: centerX, y: centerY }); // Начальная точка для корневого

  for (const radius of sortedRadii) {
    if (!radius.isActive) continue;

    // Получаем начальную точку (конец родителя или центр)
    const parentEndPoint = endPointMap.get(radius.parentId);
    const startPoint = parentEndPoint || {
      x: centerX,
      y: centerY,
    };

    if (!parentEndPoint && radius.parentId !== null) {
      console.warn(
        `⚠️ Radius ${radius.id} has parentId ${radius.parentId} but parent endpoint not found! Using center.`
      );
    }

    // Вычисляем текущий угол с учетом времени
    let currentAngle: number;
    if (radius.rotationSpeed === 0) {
      // Если скорость = 0, угол остается фиксированным относительно родителя
      currentAngle = radius.initialAngle;
    } else {
      const direction = radius.direction === "clockwise" ? -1 : 1;
      const angularVelocity = direction * radius.rotationSpeed * 2 * Math.PI; // rad/s
      currentAngle = radius.initialAngle + angularVelocity * currentTime;
    }

    // Apply envelope to length (amplitude modulation)
    let effectiveLength = radius.length;
    if (radius.envelope?.enabled) {
      const envelopeValue = calculateEnvelopeValue(radius.envelope, currentTime);
      effectiveLength = radius.length * envelopeValue;
    }

    // Вычисляем конечную точку
    const endPoint: Point2D = {
      x: startPoint.x + effectiveLength * Math.cos(currentAngle),
      y: startPoint.y + effectiveLength * Math.sin(currentAngle),
    };

    // Сохраняем позицию
    positions.push({
      radiusId: radius.id,
      startPoint,
      endPoint,
      angle: currentAngle,
      length: effectiveLength, // Use effective length for display
    });

    // Сохраняем конечную точку для потомков
    endPointMap.set(radius.id, endPoint);
  }

  return positions;
}

/**
 * Получает конечную точку последнего радиуса в цепочке
 */
export function getFinalPoint(positions: RadiusPosition[]): Point2D | null {
  if (positions.length === 0) return null;
  return positions[positions.length - 1].endPoint;
}
