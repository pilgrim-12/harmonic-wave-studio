/**
 * Представляет один вращающийся радиус в системе
 */
export interface Radius {
  /** Уникальный идентификатор радиуса */
  id: string;

  /** ID родительского радиуса (null для корневого радиуса) */
  parentId: string | null;

  /** Название радиуса для отображения */
  name: string;

  /** Длина радиуса в пикселях */
  length: number;

  /** Начальный угол в радианах */
  initialAngle: number;

  /** Текущий угол в радианах (для анимации) */
  currentAngle: number;

  /** Скорость вращения в оборотах в секунду (может быть отрицательной) */
  rotationSpeed: number;

  /** Направление вращения */
  direction: "clockwise" | "counterclockwise";

  /** Цвет радиуса для визуализации */
  color: string;

  /** Порядковый номер (для сортировки) */
  order: number;

  /** Активен ли радиус */
  isActive: boolean;

  /** ADSR Envelope configuration (optional) */
  envelope?: EnvelopeConfig;

  /** Frequency Sweep configuration (optional) */
  sweep?: SweepConfig;

  /** LFO configuration (optional) */
  lfo?: LFOConfig;

  /** Timeline with keyframes (optional) */
  timeline?: TimelineConfig;
}

/**
 * Координаты точки в 2D пространстве
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Полная информация о позиции радиуса в пространстве
 */
export interface RadiusPosition {
  radiusId: string;
  startPoint: Point2D;
  endPoint: Point2D;
  angle: number;
  length: number;
}

/**
 * Параметры для создания нового радиуса
 */
export interface CreateRadiusParams {
  parentId: string | null;
  name?: string;
  length?: number;
  initialAngle?: number;
  rotationSpeed?: number;
  direction?: "clockwise" | "counterclockwise";
  color?: string;
}

/**
 * Параметры для обновления радиуса
 */
export interface UpdateRadiusParams {
  name?: string;
  length?: number;
  initialAngle?: number;
  rotationSpeed?: number;
  direction?: "clockwise" | "counterclockwise";
  color?: string;
  isActive?: boolean;
  envelope?: EnvelopeConfig;
  sweep?: SweepConfig;
  lfo?: LFOConfig;
  timeline?: TimelineConfig;
}

// ============================================================================
// ADSR ENVELOPE
// ============================================================================

/**
 * ADSR Envelope configuration
 * Controls how amplitude changes over time
 */
export interface EnvelopeConfig {
  /** Whether envelope is enabled */
  enabled: boolean;

  /** Attack time in seconds (0 to peak) */
  attack: number;

  /** Decay time in seconds (peak to sustain) */
  decay: number;

  /** Sustain level (0-1, fraction of peak) */
  sustain: number;

  /** Release time in seconds (sustain to 0) */
  release: number;

  /** Envelope curve type */
  curve: "linear" | "exponential";

  /** Whether envelope should loop */
  loop: boolean;

  /** Total duration for one envelope cycle (for looping) */
  loopDuration?: number;
}

/**
 * Preset envelope types
 */
export type EnvelopePreset = "none" | "pluck" | "pad" | "percussion" | "swell" | "custom";

/**
 * Default envelope values
 */
export const DEFAULT_ENVELOPE: EnvelopeConfig = {
  enabled: false,
  attack: 0.1,
  decay: 0.2,
  sustain: 0.7,
  release: 0.3,
  curve: "exponential",
  loop: false,
};

/**
 * Envelope preset configurations
 */
export const ENVELOPE_PRESETS: Record<EnvelopePreset, Partial<EnvelopeConfig>> = {
  none: { enabled: false },
  pluck: { enabled: true, attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5, curve: "exponential" },
  pad: { enabled: true, attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.0, curve: "linear" },
  percussion: { enabled: true, attack: 0.005, decay: 0.15, sustain: 0, release: 0.1, curve: "exponential" },
  swell: { enabled: true, attack: 1.0, decay: 0.1, sustain: 0.9, release: 0.5, curve: "linear" },
  custom: { enabled: true },
};

// ============================================================================
// FREQUENCY SWEEP
// ============================================================================

/**
 * Frequency Sweep configuration
 * Controls linear frequency change from startFreq to endFreq over duration
 */
export interface SweepConfig {
  /** Whether sweep is enabled */
  enabled: boolean;

  /** Starting frequency in Hz */
  startFreq: number;

  /** Ending frequency in Hz */
  endFreq: number;

  /** Duration of sweep in seconds */
  duration: number;

  /** Whether sweep should loop */
  loop: boolean;
}

/**
 * Default sweep values
 */
export const DEFAULT_SWEEP: SweepConfig = {
  enabled: false,
  startFreq: 1.0,
  endFreq: 5.0,
  duration: 5.0,
  loop: false,
};

/**
 * Sweep preset types
 */
export type SweepPreset = "none" | "slow-rise" | "fast-rise" | "slow-fall" | "fast-fall" | "custom";

/**
 * Sweep preset configurations
 */
export const SWEEP_PRESETS: Record<SweepPreset, Partial<SweepConfig>> = {
  none: { enabled: false },
  "slow-rise": { enabled: true, startFreq: 0.5, endFreq: 3.0, duration: 10.0, loop: false },
  "fast-rise": { enabled: true, startFreq: 1.0, endFreq: 8.0, duration: 3.0, loop: false },
  "slow-fall": { enabled: true, startFreq: 5.0, endFreq: 0.5, duration: 10.0, loop: false },
  "fast-fall": { enabled: true, startFreq: 8.0, endFreq: 1.0, duration: 3.0, loop: false },
  custom: { enabled: true },
};

// ============================================================================
// LFO (Low Frequency Oscillator)
// ============================================================================

/**
 * LFO waveform types
 */
export type LFOWaveform = "sine" | "square" | "triangle" | "sawtooth";

/**
 * LFO target parameter
 */
export type LFOTarget = "amplitude" | "frequency" | "phase";

/**
 * LFO configuration
 * Modulates a parameter with a low-frequency oscillator
 */
export interface LFOConfig {
  /** Whether LFO is enabled */
  enabled: boolean;

  /** LFO rate in Hz (how fast the oscillation) */
  rate: number;

  /** Modulation depth (0-1, how much to modulate) */
  depth: number;

  /** Waveform shape */
  waveform: LFOWaveform;

  /** Target parameter to modulate */
  target: LFOTarget;

  /** Phase offset in radians (0-2π) */
  phase: number;
}

/**
 * Default LFO values
 */
export const DEFAULT_LFO: LFOConfig = {
  enabled: false,
  rate: 2.0,
  depth: 0.3,
  waveform: "sine",
  target: "amplitude",
  phase: 0,
};

/**
 * LFO preset types
 */
export type LFOPreset = "none" | "vibrato" | "tremolo" | "wobble" | "pulse" | "custom";

/**
 * LFO preset configurations
 */
export const LFO_PRESETS: Record<LFOPreset, Partial<LFOConfig>> = {
  none: { enabled: false },
  vibrato: { enabled: true, rate: 5.0, depth: 0.1, waveform: "sine", target: "frequency" },
  tremolo: { enabled: true, rate: 4.0, depth: 0.5, waveform: "sine", target: "amplitude" },
  wobble: { enabled: true, rate: 1.0, depth: 0.3, waveform: "triangle", target: "frequency" },
  pulse: { enabled: true, rate: 2.0, depth: 0.8, waveform: "square", target: "amplitude" },
  custom: { enabled: true },
};

// ============================================================================
// KEYFRAME TIMELINE
// ============================================================================

/**
 * Parameters that can be animated with keyframes
 */
export type KeyframeTarget = "amplitude" | "frequency" | "phase";

/**
 * Interpolation type between keyframes
 */
export type KeyframeEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "step";

/**
 * Single keyframe - a parameter value at a specific time
 */
export interface Keyframe {
  /** Unique identifier */
  id: string;

  /** Time in seconds */
  time: number;

  /** Value at this keyframe (interpreted based on target) */
  value: number;

  /** Easing to next keyframe */
  easing: KeyframeEasing;
}

/**
 * Keyframe track for a specific parameter
 */
export interface KeyframeTrack {
  /** Target parameter to animate */
  target: KeyframeTarget;

  /** Whether this track is enabled */
  enabled: boolean;

  /** List of keyframes sorted by time */
  keyframes: Keyframe[];
}

/**
 * Timeline configuration for a radius
 */
export interface TimelineConfig {
  /** Whether timeline is enabled */
  enabled: boolean;

  /** Total duration of timeline in seconds */
  duration: number;

  /** Whether timeline should loop */
  loop: boolean;

  /** Keyframe tracks */
  tracks: KeyframeTrack[];
}

/**
 * Default timeline values
 */
export const DEFAULT_TIMELINE: TimelineConfig = {
  enabled: false,
  duration: 10,
  loop: true,
  tracks: [],
};

/**
 * Create a new keyframe with unique ID
 */
export function createKeyframe(time: number, value: number, easing: KeyframeEasing = "linear"): Keyframe {
  return {
    id: `kf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time,
    value,
    easing,
  };
}

/**
 * Create a new keyframe track
 */
export function createKeyframeTrack(target: KeyframeTarget): KeyframeTrack {
  return {
    target,
    enabled: true,
    keyframes: [],
  };
}
