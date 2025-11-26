"use client";

import React, { useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";

export const FilteredSignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const originalLength = useSignalProcessingStore(
    (state) => state.original.length
  );
  const filteredLength = useFilterStore((state) => state.filteredSignal.length);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      frameCountRef.current++;
      if (frameCountRef.current % 2 === 0) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;

        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);

        const padding = { left: 40, right: 20, top: 30, bottom: 30 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        const { signalBuffer, noisy, scale } = useSignalProcessingStore.getState();
        const { filteredSignal, isFilterApplied } = useFilterStore.getState();
        const { currentTime, settings } = useSimulationStore.getState();
        const graphDuration = settings.graphDuration;

        drawGridAndAxes(ctx, width, height, padding, currentTime, graphDuration, scale);

        if (signalBuffer.length > 1) {
          const hasFiltered = isFilterApplied && filteredSignal.length > 0;
          drawSignals(
            ctx,
            signalBuffer,
            noisy,
            filteredSignal,
            hasFiltered,
            scale,
            padding,
            graphWidth,
            graphHeight,
            currentTime,
            graphDuration
          );
        } else {
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Apply filter first", width / 2, height / 2);
        }

        ctx.fillStyle = "#43e97b";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Signal Comparison", padding.left, 8);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [originalLength, filteredLength]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={16} className="text-[#43e97b]" />
        <h3 className="text-sm font-bold text-white">Signal Comparison</h3>
      </div>
      <div className="flex-1 min-h-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

function drawGridAndAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: { left: number; right: number; top: number; bottom: number },
  currentTime: number,
  graphDuration: number,
  scale: { minY: number; maxY: number }
) {
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const { minY, maxY } = scale;
  const yRange = Math.max(Math.abs(maxY), Math.abs(minY)) * 1.2 || 100;

  const timeToX = (t: number) => {
    const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
    return padding.left + normalizedTime * graphWidth;
  };

  const yToCanvas = (y: number) => {
    return padding.top + graphHeight / 2 - (y / yRange) * (graphHeight / 2);
  };

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  for (let i = -2; i <= 2; i++) {
    const y = yToCanvas(i * (yRange / 2));
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  const timeStep = graphDuration / 5;
  for (let i = 0; i <= 5; i++) {
    const t = currentTime - graphDuration + i * timeStep;
    const x = timeToX(t);
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(padding.left, yToCanvas(0));
  ctx.lineTo(width - padding.right, yToCanvas(0));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = -2; i <= 2; i++) {
    const value = i * (yRange / 2);
    const y = yToCanvas(value);
    ctx.fillText(value.toFixed(0), padding.left - 5, y);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i <= 5; i++) {
    const t = currentTime - graphDuration + i * timeStep;
    const x = timeToX(t);
    ctx.fillText(t.toFixed(1) + "s", x, height - padding.bottom + 5);
  }

  ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Time (s)", width / 2, height - 5);

  ctx.save();
  ctx.translate(12, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Amplitude", 0, 0);
  ctx.restore();
}

function drawSignals(
  ctx: CanvasRenderingContext2D,
  signalBuffer: { time: number; y: number }[],
  noisy: number[],
  filtered: number[],
  hasFiltered: boolean,
  scale: { minY: number; maxY: number; avgY: number },
  padding: { left: number; right: number; top: number; bottom: number },
  graphWidth: number,
  graphHeight: number,
  currentTime: number,
  graphDuration: number
) {
  const { minY, maxY, avgY } = scale;
  const yRange = Math.max(Math.abs(maxY), Math.abs(minY)) * 1.2 || 100;

  const timeToX = (t: number) => {
    const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
    return padding.left + normalizedTime * graphWidth;
  };

  const yToCanvas = (y: number) => {
    const centered = y - avgY;
    return padding.top + graphHeight / 2 - (centered / yRange) * (graphHeight / 2);
  };

  // Draw noisy (faded if filtered exists)
  if (noisy.length > 0) {
    ctx.strokeStyle = hasFiltered ? "rgba(255, 107, 107, 0.3)" : "#ff6b6b";
    ctx.lineWidth = hasFiltered ? 1.5 : 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    let firstPoint = true;
    for (let i = 0; i < signalBuffer.length && i < noisy.length; i++) {
      const point = signalBuffer[i];
      const x = timeToX(point.time);
      if (x < padding.left) continue;

      const y = yToCanvas(noisy[i]);

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Draw filtered
  if (hasFiltered) {
    ctx.strokeStyle = "#43e97b";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let firstPoint = true;
    for (let i = 0; i < signalBuffer.length && i < filtered.length; i++) {
      const point = signalBuffer[i];
      const x = timeToX(point.time);
      if (x < padding.left) continue;

      const y = yToCanvas(filtered[i]);

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
