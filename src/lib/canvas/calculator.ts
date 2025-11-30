import { Radius, Point2D, RadiusPosition, EnvelopeConfig, SweepConfig, LFOConfig } from "@/types/radius";

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
 * Calculate sweep frequency at a given time
 * Linear interpolation from startFreq to endFreq over duration
 * Returns frequency in Hz
 */
export function calculateSweepFrequency(
  sweep: SweepConfig,
  baseFreq: number,
  time: number
): number {
  if (!sweep.enabled) return baseFreq;

  const { startFreq, endFreq, duration, loop } = sweep;

  // Handle looping
  let t = time;
  if (loop && duration > 0) {
    t = time % duration;
  }

  // Clamp time to duration
  const progress = Math.min(t / duration, 1);

  // Linear interpolation
  return startFreq + (endFreq - startFreq) * progress;
}

/**
 * Calculate LFO value at a given time
 * Returns a value between -1 and 1 based on waveform
 */
export function calculateLFOValue(
  lfo: LFOConfig,
  time: number
): number {
  if (!lfo.enabled) return 0;

  const { rate, depth, waveform, phase } = lfo;
  const t = time * rate * 2 * Math.PI + phase;

  let rawValue: number;

  switch (waveform) {
    case "sine":
      rawValue = Math.sin(t);
      break;
    case "square":
      rawValue = Math.sin(t) >= 0 ? 1 : -1;
      break;
    case "triangle":
      // Triangle wave: 2 * |2 * (t/2π - floor(t/2π + 0.5))| - 1
      const normalized = (t / (2 * Math.PI)) % 1;
      rawValue = 4 * Math.abs(normalized - 0.5) - 1;
      break;
    case "sawtooth":
      // Sawtooth wave: 2 * (t/2π - floor(t/2π + 0.5))
      rawValue = 2 * ((t / (2 * Math.PI)) % 1) - 1;
      break;
    default:
      rawValue = 0;
  }

  return rawValue * depth;
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

    // Calculate LFO modulation value if enabled
    let lfoValue = 0;
    if (radius.lfo?.enabled) {
      lfoValue = calculateLFOValue(radius.lfo, currentTime);
    }

    // Get effective frequency (with sweep if enabled)
    let effectiveFreq = radius.rotationSpeed;
    if (radius.sweep?.enabled) {
      effectiveFreq = calculateSweepFrequency(radius.sweep, radius.rotationSpeed, currentTime);
    }

    // Apply LFO to frequency if target is frequency
    if (radius.lfo?.enabled && radius.lfo.target === "frequency") {
      // LFO modulates frequency: freq * (1 + lfoValue)
      effectiveFreq = effectiveFreq * (1 + lfoValue);
    }

    // Вычисляем текущий угол с учетом времени
    let currentAngle: number;
    if (effectiveFreq === 0) {
      // Если скорость = 0, угол остается фиксированным относительно родителя
      currentAngle = radius.initialAngle;
    } else {
      const direction = radius.direction === "clockwise" ? -1 : 1;

      // For sweep: need to integrate frequency over time for correct phase
      if (radius.sweep?.enabled) {
        // Linear sweep: integral of (f0 + (f1-f0)*t/T) from 0 to t
        // = f0*t + (f1-f0)*t^2/(2T)
        const { startFreq, endFreq, duration, loop } = radius.sweep;
        let t = currentTime;
        let cycles = 0;

        if (loop && duration > 0) {
          const fullCycles = Math.floor(currentTime / duration);
          // Phase accumulated during full cycles
          const cyclePhase = (startFreq + endFreq) / 2 * duration; // average freq * duration
          cycles = fullCycles * cyclePhase;
          t = currentTime % duration;
        }

        // Phase for current partial cycle
        const phase = startFreq * t + (endFreq - startFreq) * t * t / (2 * duration);
        const totalPhase = cycles + phase;

        const angularVelocity = direction * 2 * Math.PI;
        currentAngle = radius.initialAngle + angularVelocity * totalPhase;
      } else {
        const angularVelocity = direction * effectiveFreq * 2 * Math.PI; // rad/s
        currentAngle = radius.initialAngle + angularVelocity * currentTime;
      }
    }

    // Apply LFO to phase if target is phase
    if (radius.lfo?.enabled && radius.lfo.target === "phase") {
      // LFO adds to the angle directly
      currentAngle += lfoValue * Math.PI; // Scale by π for meaningful phase modulation
    }

    // Apply envelope to length (amplitude modulation)
    let effectiveLength = radius.length;
    if (radius.envelope?.enabled) {
      const envelopeValue = calculateEnvelopeValue(radius.envelope, currentTime);
      effectiveLength = radius.length * envelopeValue;
    }

    // Apply LFO to amplitude if target is amplitude
    if (radius.lfo?.enabled && radius.lfo.target === "amplitude") {
      // LFO modulates amplitude: length * (1 + lfoValue)
      // Since lfoValue is between -depth and +depth, amplitude oscillates
      effectiveLength = effectiveLength * (1 + lfoValue);
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
