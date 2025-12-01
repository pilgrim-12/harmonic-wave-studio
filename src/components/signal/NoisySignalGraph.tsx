"use client";

import React, { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

export const NoisySignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const originalLength = useSignalProcessingStore(
    (state) => state.original.length
  );

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

        const padding = { left: 40, right: 20, top: 15, bottom: 30 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        const { signalBuffer, original, noisy, noiseApplied, scale } =
          useSignalProcessingStore.getState();
        const { currentTime, settings } = useSimulationStore.getState();
        const graphDuration = settings.graphDuration;

        drawGridAndAxes(ctx, width, height, padding, currentTime, graphDuration, scale);

        if (signalBuffer.length > 1 && original.length > 1) {
          const hasNoisy = noiseApplied && noisy.length > 0;
          drawSignals(
            ctx,
            signalBuffer,
            original,
            noisy,
            hasNoisy,
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
          ctx.fillText("Apply noise first", width / 2, height / 2);
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [originalLength]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-[#ff6b6b]" />
        <h3 className="text-sm font-bold text-[#ff6b6b]">Signal with Noise</h3>
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
  original: number[],
  noisy: number[],
  hasNoisy: boolean,
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

  // Set up clipping region for the graph area
  ctx.save();
  ctx.beginPath();
  ctx.rect(padding.left, padding.top, graphWidth, graphHeight);
  ctx.clip();

  // Draw original (faded if noisy exists)
  ctx.strokeStyle = hasNoisy ? "rgba(102, 126, 234, 0.4)" : "#667eea";
  ctx.lineWidth = hasNoisy ? 1.5 : 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let firstPoint = true;
  for (let i = 0; i < signalBuffer.length && i < original.length; i++) {
    const point = signalBuffer[i];
    const x = timeToX(point.time);
    const y = yToCanvas(original[i]);

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Current point dot for original signal (when no noise applied)
  if (!hasNoisy && signalBuffer.length > 0 && original.length > 0) {
    const lastIdx = Math.min(signalBuffer.length, original.length) - 1;
    const lastPoint = signalBuffer[lastIdx];
    const dotX = timeToX(lastPoint.time);
    const dotY = yToCanvas(original[lastIdx]);
    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw noisy
  if (hasNoisy) {
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.beginPath();

    firstPoint = true;
    for (let i = 0; i < signalBuffer.length && i < noisy.length; i++) {
      const point = signalBuffer[i];
      const x = timeToX(point.time);
      const y = yToCanvas(noisy[i]);

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Current point dot for noisy signal
    const lastIdx = Math.min(signalBuffer.length, noisy.length) - 1;
    if (lastIdx >= 0) {
      const lastPoint = signalBuffer[lastIdx];
      const dotX = timeToX(lastPoint.time);
      const dotY = yToCanvas(noisy[lastIdx]);
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  ctx.restore();
}
