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
 * Рисует один радиус
 */
export function drawRadius(
  ctx: CanvasRenderingContext2D,
  position: RadiusPosition,
  radius: Radius
) {
  const { startPoint, endPoint } = position;

  // Линия радиуса
  ctx.strokeStyle = radius.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  // Начальная точка (меньше)
  ctx.fillStyle = radius.color;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;

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
}

/**
 * Рисует все радиусы
 */
export function drawAllRadii(
  ctx: CanvasRenderingContext2D,
  positions: RadiusPosition[],
  radii: Radius[]
) {
  const radiusMap = new Map(radii.map((r) => [r.id, r]));

  for (const position of positions) {
    const radius = radiusMap.get(position.radiusId);
    if (radius) {
      drawRadius(ctx, position, radius);
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
