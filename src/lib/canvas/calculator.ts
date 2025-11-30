import {
  Radius,
  Point2D,
  RadiusPosition,
  EnvelopeConfig,
  SweepConfig,
  LFOConfig,
  TimelineConfig,
  KeyframeTrack,
  KeyframeEasing,
  KeyframeTarget
} from "@/types/radius";

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
 * Apply easing function to progress (0-1)
 */
function applyEasing(progress: number, easing: KeyframeEasing): number {
  switch (easing) {
    case "linear":
      return progress;
    case "ease-in":
      return progress * progress;
    case "ease-out":
      return 1 - (1 - progress) * (1 - progress);
    case "ease-in-out":
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case "step":
      return progress < 1 ? 0 : 1;
    default:
      return progress;
  }
}

/**
 * Get interpolated value from a keyframe track at a given time
 * Returns the interpolated value or null if track is empty/disabled
 */
export function getKeyframeValue(
  track: KeyframeTrack,
  time: number,
  timelineDuration: number,
  loop: boolean
): number | null {
  if (!track.enabled || track.keyframes.length === 0) {
    return null;
  }

  // Handle looping
  let t = time;
  if (loop && timelineDuration > 0) {
    t = time % timelineDuration;
  }

  const keyframes = [...track.keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (t <= keyframes[0].time) {
    return keyframes[0].value;
  }

  // After last keyframe
  if (t >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }

  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf1 = keyframes[i];
    const kf2 = keyframes[i + 1];

    if (t >= kf1.time && t < kf2.time) {
      // Interpolate between kf1 and kf2
      const duration = kf2.time - kf1.time;
      const progress = (t - kf1.time) / duration;
      const easedProgress = applyEasing(progress, kf1.easing);

      return kf1.value + (kf2.value - kf1.value) * easedProgress;
    }
  }

  return keyframes[keyframes.length - 1].value;
}

/**
 * Calculate all timeline values for a radius at given time
 * Returns object with amplitude, frequency, phase multipliers/offsets
 */
export function calculateTimelineValues(
  timeline: TimelineConfig,
  time: number
): { amplitude: number | null; frequency: number | null; phase: number | null } {
  if (!timeline.enabled) {
    return { amplitude: null, frequency: null, phase: null };
  }

  const result: { amplitude: number | null; frequency: number | null; phase: number | null } = {
    amplitude: null,
    frequency: null,
    phase: null,
  };

  for (const track of timeline.tracks) {
    const value = getKeyframeValue(track, time, timeline.duration, timeline.loop);
    if (value !== null) {
      result[track.target] = value;
    }
  }

  return result;
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

    // Calculate timeline keyframe values if enabled
    const timelineValues = radius.timeline?.enabled
      ? calculateTimelineValues(radius.timeline, currentTime)
      : { amplitude: null, frequency: null, phase: null };

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

    // Apply timeline keyframe frequency (overrides base frequency)
    if (timelineValues.frequency !== null) {
      effectiveFreq = timelineValues.frequency;
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

    // Apply timeline keyframe phase (adds to current angle)
    if (timelineValues.phase !== null) {
      currentAngle += (timelineValues.phase * Math.PI) / 180; // Convert degrees to radians
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

    // Apply timeline keyframe amplitude (overrides base amplitude)
    if (timelineValues.amplitude !== null) {
      effectiveLength = timelineValues.amplitude;
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
