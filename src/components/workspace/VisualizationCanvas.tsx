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
  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    updateFps,
    settings,
    activeTrackingRadiusId,
  } = useSimulationStore();

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

  // Анимационный цикл - ВСЕГДА работает (даже когда остановлено)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Обновляем время симуляции ТОЛЬКО если играет
      let newTime = currentTime; // ✅ Определяем снаружи

      if (isPlaying) {
        newTime = currentTime + deltaTime * settings.animationSpeed;
        setCurrentTime(newTime);

        // Расчет FPS
        frameCount++;
        fpsTime += deltaTime;
        if (fpsTime >= 1) {
          updateFps(frameCount / fpsTime);
          frameCount = 0;
          fpsTime = 0;
        }
      }

      // Отрисовка
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Очистка
      clearCanvas(ctx, canvas.width, canvas.height);

      // ✅ Сетка - ВСЕГДА показываем
      drawGrid(
        ctx,
        centerX,
        centerY,
        canvas.width,
        canvas.height,
        settings.gridSize
      );

      // ✅ Оси - ВСЕГДА показываем
      drawAxes(ctx, centerX, centerY, canvas.width, canvas.height);

      // Apply zoom transform ТОЛЬКО для радиусов и следа
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(settings.zoom, settings.zoom);
      ctx.translate(-centerX, -centerY);

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
        // Определяем какую точку отслеживать для следа
        let finalPoint = null;

        if (activeTrackingRadiusId) {
          // Отслеживаем выбранный радиус
          const trackingPosition = positions.find(
            (pos) => pos.radiusId === activeTrackingRadiusId
          );
          finalPoint = trackingPosition?.endPoint || null;
        } else {
          // По умолчанию - последний радиус
          finalPoint = getFinalPoint(positions);
        }

        if (finalPoint) {
          trailRef.current.push(finalPoint);

          // Ограничиваем длину следа
          if (trailRef.current.length > settings.trailLength) {
            trailRef.current.shift();
          }
        }

        // Рисуем след
        drawTrail(ctx, trailRef.current, settings.trailColor);
      } else {
        trailRef.current = [];
      }

      // Рисуем радиусы с выделением активной ветки
      drawAllRadii(ctx, positions, radii, activeTrackingRadiusId);

      // Restore transform
      ctx.restore();

      // ✅ Следующий кадр - ВСЕГДА продолжаем
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPlaying,
    radii,
    currentTime,
    settings,
    setCurrentTime,
    updateFps,
    activeTrackingRadiusId,
  ]);

  // Сброс следа при изменении радиусов или активного радиуса
  useEffect(() => {
    trailRef.current = [];
  }, [radii, activeTrackingRadiusId]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
};
