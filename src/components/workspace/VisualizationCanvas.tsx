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
  const trailsRef = useRef<Map<string, Point2D[]>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  const { radii } = useRadiusStore();
  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    updateFps,
    updateComputeLoad,
    settings,
    activeTrackingRadiusId,
    trackedRadiusIds,
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

    // For compute load measurement
    let frameStartTime = 0;
    const frameTimes: number[] = [];
    const maxFrameSamples = 60;

    const animate = (time: number) => {
      frameStartTime = performance.now(); // Start measuring frame computation

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

      // Сетка - если включена
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

      // Оси - если включены
      if (settings.showAxes) {
        drawAxes(ctx, centerX, centerY, canvas.width, canvas.height);
      }

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

      // Обновляем следы для множественных радиусов
      if (settings.showTrail && trackedRadiusIds.length > 0) {
        // Удаляем следы для радиусов, которые больше не отслеживаются
        const currentTrails = trailsRef.current;
        for (const radiusId of currentTrails.keys()) {
          if (!trackedRadiusIds.includes(radiusId)) {
            currentTrails.delete(radiusId);
          }
        }

        // Обновляем следы для каждого отслеживаемого радиуса
        for (const radiusId of trackedRadiusIds) {
          const trackingPosition = positions.find(
            (pos) => pos.radiusId === radiusId
          );

          if (trackingPosition) {
            const finalPoint = trackingPosition.endPoint;

            // Инициализируем массив для нового радиуса
            if (!currentTrails.has(radiusId)) {
              currentTrails.set(radiusId, []);
            }

            const trail = currentTrails.get(radiusId)!;
            trail.push(finalPoint);

            // Ограничиваем длину следа
            if (trail.length > settings.trailLength) {
              trail.shift();
            }
          }
        }

        // Рисуем все следы
        for (const [radiusId, trail] of currentTrails.entries()) {
          const radius = radii.find((r) => r.id === radiusId);
          const color = radius?.color || settings.trailColor;
          drawTrail(ctx, trail, color);
        }
      } else if (!settings.showTrail) {
        trailsRef.current.clear();
      }

      // Рисуем радиусы с выделением активной ветки (если включено)
      if (settings.showRadii) {
        drawAllRadii(ctx, positions, radii, activeTrackingRadiusId);
      }

      // Restore transform
      ctx.restore();

      // Measure frame computation time
      const frameEndTime = performance.now();
      const frameComputeTime = frameEndTime - frameStartTime;

      if (isPlaying) {
        frameTimes.push(frameComputeTime);

        // Keep only last N samples
        if (frameTimes.length > maxFrameSamples) {
          frameTimes.shift();
        }

        // Calculate and update compute load
        if (frameTimes.length >= 10) {
          const avgFrameTime =
            frameTimes.reduce((sum, t) => sum + t, 0) / frameTimes.length;

          // Convert to load percentage based on actual frame time
          // 0ms = 0%, 16.67ms (target 60fps) = 100%
          // This shows how much of the frame budget is being used
          const targetFrameTime = 1000 / 60; // 16.67ms
          const rawLoad = (avgFrameTime / targetFrameTime) * 100;
          const cappedLoad = Math.min(100, Math.max(0, rawLoad));

          updateComputeLoad(Math.round(cappedLoad));
        }
      } else {
        // Reset when not playing
        frameTimes.length = 0;
        updateComputeLoad(0);
      }

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
    updateComputeLoad,
    activeTrackingRadiusId,
    trackedRadiusIds,
  ]);

  // Сброс следов при изменении радиусов
  useEffect(() => {
    trailsRef.current.clear();
  }, [radii]);

  // Сброс следов при Reset (currentTime === 0 и не играет)
  useEffect(() => {
    if (currentTime === 0 && !isPlaying) {
      trailsRef.current.clear();
    }
  }, [currentTime, isPlaying]);

  // Обработчик масштабирования колесиком мыши
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { zoom } = useSimulationStore.getState().settings;
      const { updateSettings } = useSimulationStore.getState();

      // deltaY < 0 = scroll up = zoom in
      // deltaY > 0 = scroll down = zoom out
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5.0, zoom + zoomDelta));

      updateSettings({ zoom: newZoom });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <canvas
      id="main-canvas"
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
};
