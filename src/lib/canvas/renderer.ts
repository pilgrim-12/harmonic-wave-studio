import { RadiusPosition, Point2D } from "@/types/radius";
import { Radius } from "@/types/radius";

/**
 * Очищает canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);
}

/**
 * Рисует координатные оси
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number
) {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;

  // Горизонтальная ось
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  // Вертикальная ось
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();
}

/**
 * Рисует сетку
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  gridSize: number
) {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  // Вертикальные линии
  for (let x = centerX % gridSize; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Горизонтальные линии
  for (let y = centerY % gridSize; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Рисует центральную точку
 */
export function drawCenterPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.fillStyle = "#4CAF50";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Получает путь от корня до указанного радиуса
 */
function getPathToRadius(targetRadiusId: string, radii: Radius[]): Set<string> {
  const path = new Set<string>();
  const radiusMap = new Map(radii.map((r) => [r.id, r]));

  let currentId: string | null = targetRadiusId;

  while (currentId !== null) {
    path.add(currentId);
    const radius = radiusMap.get(currentId);
    currentId = radius?.parentId || null;
  }

  return path;
}

/**
 * Рисует один радиус
 */
export function drawRadius(
  ctx: CanvasRenderingContext2D,
  position: RadiusPosition,
  radius: Radius,
  isActive: boolean = true
) {
  const { startPoint, endPoint } = position;

  // Применяем затемнение если радиус не активен
  const opacity = isActive ? 1.0 : 0.3;
  const lineWidth = isActive ? 3 : 2;

  ctx.globalAlpha = opacity;

  // Линия радиуса
  ctx.strokeStyle = radius.color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  // Начальная точка (меньше)
  ctx.fillStyle = radius.color;
  ctx.globalAlpha = opacity * 0.5;
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, 4, 0, 2 * Math.PI);
  ctx.fill();

  ctx.globalAlpha = opacity;

  // Конечная точка (больше)
  ctx.fillStyle = radius.color;
  ctx.beginPath();
  ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Белая обводка для конечной точки
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
  ctx.stroke();

  // Дополнительное свечение для активной конечной точки
  if (isActive) {
    ctx.strokeStyle = radius.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 10, 0, 2 * Math.PI);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

/**
 * Рисует все радиусы с выделением активной ветки
 */
export function drawAllRadii(
  ctx: CanvasRenderingContext2D,
  positions: RadiusPosition[],
  radii: Radius[],
  activeTrackingRadiusId?: string | null
) {
  const radiusMap = new Map(radii.map((r) => [r.id, r]));

  // Получаем путь активной ветки (от корня до активного радиуса)
  const activePath = activeTrackingRadiusId
    ? getPathToRadius(activeTrackingRadiusId, radii)
    : null;

  for (const position of positions) {
    const radius = radiusMap.get(position.radiusId);
    if (radius) {
      // Радиус активен если он в пути к активному радиусу, или если нет активного радиуса
      const isActive = activePath ? activePath.has(radius.id) : true;
      drawRadius(ctx, position, radius, isActive);
    }
  }
}

/**
 * Рисует след движения
 */
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: Point2D[],
  color: string = "#667eea"
) {
  if (trail.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);

  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }

  ctx.stroke();
}
