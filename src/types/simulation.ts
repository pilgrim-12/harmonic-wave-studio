import { Radius } from "./radius";

/**
 * Настройки симуляции
 */
export interface SimulationSettings {
  /** Скорость анимации (множитель) */
  animationSpeed: number;

  /** Длительность отображаемого графика в секундах */
  graphDuration: number;

  /** Показывать ли след движения */
  showTrail: boolean;

  /** Длина следа в точках */
  trailLength: number;

  /** Показывать ли оси координат */
  showAxes: boolean;

  /** Показывать ли сетку */
  showGrid: boolean;

  /** Размер сетки в пикселях */
  gridSize: number;

  /** Zoom level (0.1 - 2.0) */
  zoom: number;

  /** Signal sample rate in Hz (NEW in Phase 15) */
  signalSampleRate: number;
}

/**
 * Состояние симуляции
 */
export interface SimulationState {
  /** Запущена ли анимация */
  isPlaying: boolean;

  /** Поставлена ли на паузу */
  isPaused: boolean;

  /** Текущее время симуляции в секундах */
  currentTime: number;

  /** FPS (frames per second) для визуализации */
  fps: number;

  /** Последнее обновление timestamp */
  lastUpdateTime: number;
}

/**
 * Полная симуляция
 */
export interface Simulation {
  /** Уникальный ID симуляции */
  id: string;

  /** ID пользователя-владельца */
  userId?: string;

  /** Название симуляции */
  title: string;

  /** Описание */
  description?: string;

  /** Массив радиусов */
  radii: Radius[];

  /** Настройки симуляции */
  settings: SimulationSettings;

  /** Публичная ли симуляция */
  isPublic: boolean;

  /** Теги для поиска */
  tags: string[];

  /** Количество лайков */
  likes?: number;

  /** Количество просмотров */
  views?: number;

  /** Дата создания */
  createdAt?: Date;

  /** Дата последнего обновления */
  updatedAt?: Date;
}

/**
 * Параметры для создания новой симуляции
 */
export interface CreateSimulationParams {
  title: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}
