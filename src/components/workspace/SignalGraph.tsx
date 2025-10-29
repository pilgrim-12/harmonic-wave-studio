"use client";

import React, { useRef, useEffect } from "react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import {
  calculateRadiusPositions,
  getFinalPoint,
} from "@/lib/canvas/calculator";
import { Point2D } from "@/types/radius";

export const SignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signalDataRef = useRef<{ time: number; y: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const { radii } = useRadiusStore();
  const { isPlaying, currentTime, settings } = useSimulationStore();

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Сброс данных при изменении радиусов
  useEffect(() => {
    signalDataRef.current = [];
  }, [radii]);

  // Отрисовка графика
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      // Очистка
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Если анимация играет, добавляем новую точку
      if (isPlaying && radii.length > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Вычисляем позицию последнего радиуса
        const positions = calculateRadiusPositions(
          radii,
          centerX,
          centerY,
          currentTime
        );
        const finalPoint = getFinalPoint(positions);

        if (finalPoint) {
          // Y координата относительно центра (инвертируем для правильного отображения)
          const y = centerY - finalPoint.y;

          signalDataRef.current.push({
            time: currentTime,
            y: y,
          });

          // Ограничиваем количество точек по времени
          const maxTime = settings.graphDuration;
          signalDataRef.current = signalDataRef.current.filter(
            (point) => currentTime - point.time <= maxTime
          );
        }
      }

      // Рисуем оси
      drawAxes(ctx, canvas.width, canvas.height);

      // Рисуем график
      if (signalDataRef.current.length > 1) {
        drawSignal(
          ctx,
          signalDataRef.current,
          canvas.width,
          canvas.height,
          currentTime,
          settings.graphDuration
        );
      }

      // Следующий кадр
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, radii, currentTime, settings.graphDuration]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
};

// Вспомогательные функции отрисовки
function drawAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const centerY = height / 2;

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;

  // Горизонтальная ось (Y = 0)
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  // Вертикальная ось (t = now)
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(width - 50, 0);
  ctx.lineTo(width - 50, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Подписи осей
  ctx.fillStyle = "#888";
  ctx.font = "12px sans-serif";
  ctx.fillText("Y", 10, centerY - 10);
  ctx.fillText("t →", width - 40, height - 10);
}

function drawSignal(
  ctx: CanvasRenderingContext2D,
  data: { time: number; y: number }[],
  width: number,
  height: number,
  currentTime: number,
  graphDuration: number
) {
  if (data.length < 2) return;

  // Находим min/max для автомасштабирования
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of data) {
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  // Добавляем padding 10%
  const range = maxY - minY;
  const padding = range * 0.1;
  minY -= padding;
  maxY += padding;

  // Если range слишком маленький, используем фиксированный
  if (range < 10) {
    minY = -50;
    maxY = 50;
  }

  const centerY = height / 2;
  const timeScale = (width - 100) / graphDuration;
  const currentX = width - 50;
  const yScale = height / (maxY - minY);

  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let firstPoint = true;

  for (const point of data) {
    const x = currentX - (currentTime - point.time) * timeScale;
    const y = centerY - (point.y - (minY + maxY) / 2) * yScale;

    if (x < 0) continue;

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Точка текущего значения
  if (data.length > 0) {
    const lastPoint = data[data.length - 1];
    const lastX = currentX - (currentTime - lastPoint.time) * timeScale;
    const lastY = centerY - (lastPoint.y - (minY + maxY) / 2) * yScale;

    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}
