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
