import { Radius, Point2D, RadiusPosition } from "@/types/radius";

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
    const startPoint = endPointMap.get(radius.parentId) || {
      x: centerX,
      y: centerY,
    };

    // Вычисляем текущий угол с учетом времени
    const direction = radius.direction === "clockwise" ? -1 : 1;
    const angularVelocity = direction * radius.rotationSpeed * 2 * Math.PI; // rad/s
    const currentAngle = radius.initialAngle + angularVelocity * currentTime;

    // Вычисляем конечную точку
    const endPoint: Point2D = {
      x: startPoint.x + radius.length * Math.cos(currentAngle),
      y: startPoint.y + radius.length * Math.sin(currentAngle),
    };

    // Сохраняем позицию
    positions.push({
      radiusId: radius.id,
      startPoint,
      endPoint,
      angle: currentAngle,
      length: radius.length,
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
