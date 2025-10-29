"use client";

import React, { useRef, useEffect } from "react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import {
  calculateRadiusPositions,
  getFinalPoint,
} from "@/lib/canvas/calculator";
import {
  clearCanvas,
  drawAxes,
  drawGrid,
  drawCenterPoint,
  drawAllRadii,
  drawTrail,
} from "@/lib/canvas/renderer";
import { Point2D } from "@/types/radius";

export const VisualizationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<Point2D[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const { radii } = useRadiusStore();
  const { isPlaying, currentTime, setCurrentTime, updateFps, settings } =
    useSimulationStore();

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Устанавливаем размер canvas по размеру родителя
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

  // Анимационный цикл
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000; // в секундах
      lastTime = time;

      // Обновляем время симуляции
      const newTime = currentTime + deltaTime * settings.animationSpeed;
      setCurrentTime(newTime);

      // Расчет FPS
      frameCount++;
      fpsTime += deltaTime;
      if (fpsTime >= 1) {
        updateFps(frameCount / fpsTime);
        frameCount = 0;
        fpsTime = 0;
      }

      // Отрисовка
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Очистка
      clearCanvas(ctx, canvas.width, canvas.height);

      // Сетка (опционально)
      if (settings.showGrid) {
        drawGrid(
          ctx,
          centerX,
          centerY,
          canvas.width,
          canvas.height,
          settings.gridSize
        );
      }

      // Оси (опционально)
      if (settings.showAxes) {
        drawAxes(ctx, centerX, centerY, canvas.width, canvas.height);
      }

      // Центральная точка
      drawCenterPoint(ctx, centerX, centerY);

      // Вычисляем позиции радиусов
      const positions = calculateRadiusPositions(
        radii,
        centerX,
        centerY,
        newTime
      );

      // Обновляем след
      if (settings.showTrail) {
        const finalPoint = getFinalPoint(positions);
        if (finalPoint) {
          trailRef.current.push(finalPoint);

          // Ограничиваем длину следа
          if (trailRef.current.length > settings.trailLength) {
            trailRef.current.shift();
          }
        }

        // Рисуем след
        drawTrail(ctx, trailRef.current);
      } else {
        trailRef.current = [];
      }

      // Рисуем радиусы
      drawAllRadii(ctx, positions, radii);

      // Следующий кадр
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, radii, currentTime, settings, setCurrentTime, updateFps]);

  // Сброс следа при изменении радиусов
  useEffect(() => {
    trailRef.current = [];
  }, [radii]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
};
