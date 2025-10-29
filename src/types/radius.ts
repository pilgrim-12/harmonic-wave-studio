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
}
