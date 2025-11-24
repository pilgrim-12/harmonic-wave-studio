"use client";

import React, { useRef, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

export const SignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // Subscribe to trigger re-renders (value used implicitly)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signalBufferLength = useSignalProcessingStore(
    (state) => state.signalBuffer.length
  );

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
        const { signalBuffer, scale } = useSignalProcessingStore.getState();
        const { currentTime, settings } = useSimulationStore.getState();

        if (signalBuffer.length > 1) {
          drawSignal(
            ctx,
            signalBuffer,
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

        drawLabels(ctx, width, height);
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
        Original Signal
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
  height: number
) {
  ctx.fillStyle = "#666";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Y", 10, 15);
  ctx.textAlign = "right";
  ctx.fillText("Time →", width - 10, height - 10);

  // Legend
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - 100, 12);
  ctx.lineTo(width - 85, 12);
  ctx.stroke();
  ctx.fillStyle = "#999";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Signal", width - 80, 15);
}

function drawSignal(
  ctx: CanvasRenderingContext2D,
  data: { time: number; y: number }[],
  scale: { minY: number; maxY: number; avgY: number },
  width: number,
  height: number,
  currentTime: number,
  graphDuration: number
) {
  const { minY, maxY, avgY } = scale;
  const centerY = height / 2;
  const timeScale = (width - 100) / graphDuration;
  const currentX = width - 50;
  const yScale = height / (maxY - minY);

  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let firstPoint = true;
  for (const point of data) {
    const x = currentX - (currentTime - point.time) * timeScale;
    if (x < 0) continue;

    const centered = point.y - avgY;
    const y = centerY - (centered - (minY + maxY) / 2) * yScale;

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Current point dot
  if (data.length > 0) {
    const last = data[data.length - 1];
    const x = currentX - (currentTime - last.time) * timeScale;
    const centered = last.y - avgY;
    const y = centerY - (centered - (minY + maxY) / 2) * yScale;
    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}
