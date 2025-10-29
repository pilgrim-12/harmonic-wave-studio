/**
 * Типы шумов
 */
export type NoiseType =
  | "white" // Белый шум - равномерный спектр
  | "pink" // Розовый шум - 1/f спектр
  | "brown" // Коричневый шум - 1/f² спектр
  | "gaussian" // Гауссов шум
  | "impulse" // Импульсный шум
  | "sine"; // Синусоидальная помеха

/**
 * Конфигурация шума
 */
export interface NoiseConfig {
  type: NoiseType;
  snr: number; // Signal-to-Noise Ratio в dB (0-60)
  amplitude: number; // Амплитуда шума 0-1
  frequency?: number; // Для синусоидальных помех (Hz)
}

/**
 * Типы фильтров
 */
export type FilterType =
  | "lowpass" // Низкочастотный
  | "highpass" // Высокочастотный
  | "bandpass" // Полосовой
  | "bandstop" // Режекторный
  | "moving_avg" // Скользящее среднее
  | "median" // Медианный
  | "savgol"; // Savitzky-Golay

/**
 * Конфигурация фильтра
 */
export interface FilterConfig {
  type: FilterType;
  cutoffFreq: number; // Частота среза (Hz)
  order: number; // Порядок фильтра (2, 4, 8...)
  bandwidth?: number; // Для band-pass/stop (Hz)
  windowSize?: number; // Для moving_avg и median
}

/**
 * Метрики качества сигнала
 */
export interface QualityMetrics {
  snr: number; // Signal-to-Noise Ratio (dB)
  mse: number; // Mean Square Error
  psnr: number; // Peak Signal-to-Noise Ratio (dB)
  correlation: number; // Корреляция с оригиналом (0-1)
  rmse: number; // Root Mean Square Error
}

/**
 * Состояние обработки сигнала
 */
export interface SignalProcessingState {
  original: number[]; // Оригинальный сигнал
  noisy: number[]; // С добавленным шумом
  filtered: number[]; // После фильтрации
  noiseConfig?: NoiseConfig;
  filterConfig?: FilterConfig;
  metrics: {
    originalVsNoisy: QualityMetrics;
    originalVsFiltered: QualityMetrics;
    improvement: number; // Улучшение SNR в dB
  };
}

/**
 * Данные сигнала (массив точек)
 */
export interface SignalData {
  time: number[]; // Временные метки
  amplitude: number[]; // Амплитуды
  sampleRate: number; // Частота дискретизации (Hz)
}
