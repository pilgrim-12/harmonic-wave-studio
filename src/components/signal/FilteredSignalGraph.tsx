"use client";

import React, { useRef, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";

export const FilteredSignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // Subscribe to trigger re-renders (values used implicitly)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const originalLength = useSignalProcessingStore(
    (state) => state.original.length
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filteredLength = useFilterStore((state) => state.filteredSignal.length);

  // Initialize canvas size
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
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      frameCountRef.current++;
      if (frameCountRef.current % 2 === 0) {
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);

        // Grid
        drawGrid(ctx, width, height);

        // Get data
        const { signalBuffer, original, noisy, noiseApplied, scale } =
          useSignalProcessingStore.getState();
        const { filteredSignal, isFilterApplied } = useFilterStore.getState();
        const { currentTime, settings } = useSimulationStore.getState();

        if (signalBuffer.length > 1) {
          drawSignals(
            ctx,
            signalBuffer,
            original,
            noisy,
            filteredSignal,
            noiseApplied,
            isFilterApplied,
            scale,
            width,
            height,
            currentTime,
            settings.graphDuration
          );
        } else {
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("No signal data", width / 2, height / 2);
        }

        drawLabels(
          ctx,
          width,
          height,
          noiseApplied && noisy.length > 0,
          isFilterApplied
        );
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Signal Comparison
      </div>
    </div>
  );
};

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = (i * height) / 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = 0; i <= 8; i++) {
    const x = (i * width) / 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hasNoise: boolean,
  hasFilter: boolean
) {
  ctx.fillStyle = "#666";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Y", 10, 15);
  ctx.textAlign = "right";
  ctx.fillText("Time →", width - 10, height - 10);

  const legendX = width - 130;
  let y = 10;

  // Original
  ctx.fillStyle = "rgba(102, 126, 234, 0.3)";
  ctx.fillRect(legendX, y, 15, 3);
  ctx.fillStyle = "#999";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Original", legendX + 20, y + 5);
  y += 15;

  // Noisy
  if (hasNoise) {
    ctx.fillStyle = "rgba(255, 107, 107, 0.6)";
    ctx.fillRect(legendX, y, 15, 3);
    ctx.fillStyle = "#999";
    ctx.fillText("Noisy", legendX + 20, y + 5);
    y += 15;
  }

  // Filtered
  if (hasFilter) {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(legendX, y, 15, 3);
    ctx.fillStyle = "#999";
    ctx.fillText("Filtered", legendX + 20, y + 5);
  }
}

function drawSignals(
  ctx: CanvasRenderingContext2D,
  signalBuffer: { time: number; y: number }[],
  original: number[],
  noisy: number[],
  filtered: number[],
  noiseApplied: boolean,
  filterApplied: boolean,
  scale: { minY: number; maxY: number; avgY: number },
  width: number,
  height: number,
  currentTime: number,
  graphDuration: number
) {
  // Need noise for this view
  if (!noiseApplied || noisy.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Apply noise first", width / 2, height / 2);
    return;
  }

  const { minY, maxY, avgY } = scale;
  const centerY = height / 2;
  const timeScale = (width - 100) / graphDuration;
  const currentX = width - 50;
  const yScale = height / (maxY - minY);

  // Draw original (thin, transparent)
  ctx.strokeStyle = "rgba(102, 126, 234, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let firstPoint = true;
  for (let i = 0; i < signalBuffer.length && i < original.length; i++) {
    const point = signalBuffer[i];
    const x = currentX - (currentTime - point.time) * timeScale;
    if (x < 0) continue;

    const centered = original[i] - avgY;
    const y = centerY - (centered - (minY + maxY) / 2) * yScale;

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Draw noisy (red, medium)
  ctx.strokeStyle = "rgba(255, 107, 107, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  firstPoint = true;
  for (let i = 0; i < signalBuffer.length && i < noisy.length; i++) {
    const point = signalBuffer[i];
    const x = currentX - (currentTime - point.time) * timeScale;
    if (x < 0) continue;

    const centered = noisy[i] - avgY;
    const y = centerY - (centered - (minY + maxY) / 2) * yScale;

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Draw filtered (green, thick)
  if (filterApplied && filtered.length > 0) {
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();

    firstPoint = true;
    for (let i = 0; i < signalBuffer.length && i < filtered.length; i++) {
      const point = signalBuffer[i];
      const x = currentX - (currentTime - point.time) * timeScale;
      if (x < 0) continue;

      const centered = filtered[i] - avgY;
      const y = centerY - (centered - (minY + maxY) / 2) * yScale;

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}
