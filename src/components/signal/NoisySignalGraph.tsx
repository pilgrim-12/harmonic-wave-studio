"use client";

import React, { useRef, useEffect } from "react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

// ✅ Cache for smooth scaling (avoid jitter) - PERSISTENT
let cachedMinY = 0;
let cachedMaxY = 0;
let scalingFrameCount = 0;

export const NoisySignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { original, noisy, noiseApplied } = useSignalProcessingStore();

  // ✅ All state in refs - no setState in effects
  const smoothedNoisyRef = useRef<number[]>([]);
  const prevNoisyRef = useRef<number[]>([]);
  const interpolationStateRef = useRef<{
    isInterpolating: boolean;
    startTime: number;
    startValues: number[];
    endValues: number[];
  }>({
    isInterpolating: false,
    startTime: 0,
    startValues: [],
    endValues: [],
  });

  // ✅ Initialize canvas size
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

  // ✅ Track noisy changes and start interpolation
  useEffect(() => {
    if (noisy.length === 0) {
      smoothedNoisyRef.current = [];
      prevNoisyRef.current = [];
      interpolationStateRef.current.isInterpolating = false;
      return;
    }

    const prevNoisy = prevNoisyRef.current;

    // If no previous signal, use current immediately
    if (prevNoisy.length === 0 || prevNoisy.length !== noisy.length) {
      smoothedNoisyRef.current = [...noisy];
      prevNoisyRef.current = [...noisy];
      interpolationStateRef.current.isInterpolating = false;
      return;
    }

    // Start interpolation
    interpolationStateRef.current = {
      isInterpolating: true,
      startTime: performance.now(),
      startValues: [...prevNoisy],
      endValues: [...noisy],
    };
  }, [noisy]);

  // ✅ Animation loop - handles both rendering and interpolation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (timestamp: number) => {
      const width = canvas.width;
      const height = canvas.height;

      // ✅ Handle interpolation in animation loop
      const interpState = interpolationStateRef.current;
      if (interpState.isInterpolating) {
        const elapsed = timestamp - interpState.startTime;
        const duration = 300; // 300ms transition
        const progress = Math.min(1, elapsed / duration);

        if (progress >= 1) {
          // Interpolation complete
          smoothedNoisyRef.current = [...interpState.endValues];
          prevNoisyRef.current = [...interpState.endValues];
          interpState.isInterpolating = false;
        } else {
          // Ease-out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          smoothedNoisyRef.current = interpState.endValues.map((endVal, i) => {
            const startVal = interpState.startValues[i] || endVal;
            return startVal + (endVal - startVal) * easedProgress;
          });
        }
      }

      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      drawGrid(ctx, width, height);

      // Draw signals if available
      if (original.length > 0) {
        drawSignals(
          ctx,
          width,
          height,
          original,
          smoothedNoisyRef.current,
          noiseApplied
        );
      } else {
        // Show placeholder
        ctx.fillStyle = "#666";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No signal data", width / 2, height / 2);
        ctx.fillText(
          "Start animation to see signals",
          width / 2,
          height / 2 + 20
        );
      }

      // Draw labels and legend
      drawLabelsAndLegend(ctx, width, height, noiseApplied);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [original, noiseApplied]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Signal with Noise
      </div>
    </div>
  );
};

/**
 * Draw grid
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 0; i <= 4; i++) {
    const y = (i * height) / 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let i = 0; i <= 8; i++) {
    const x = (i * width) / 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Center line (Y = 0)
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

/**
 * Draw signals with smooth scaling
 */
function drawSignals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  original: number[],
  noisy: number[],
  noiseApplied: boolean
) {
  // ✅ Remove DC offset (center both signals)
  const avgOriginal =
    original.reduce((sum, val) => sum + val, 0) / original.length;
  const centeredOriginal = original.map((val) => val - avgOriginal);

  let centeredNoisy: number[] = [];
  if (noisy.length > 0) {
    const avgNoisy = noisy.reduce((sum, val) => sum + val, 0) / noisy.length;
    centeredNoisy = noisy.map((val) => val - avgNoisy);
  }

  // ✅ Find min/max AFTER removing DC offset
  const allValues =
    noisy.length > 0
      ? [...centeredOriginal, ...centeredNoisy]
      : centeredOriginal;

  // Sample for performance
  const step = Math.max(1, Math.floor(allValues.length / 500));
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < allValues.length; i += step) {
    minY = Math.min(minY, allValues[i]);
    maxY = Math.max(maxY, allValues[i]);
  }

  // ✅ Use symmetric range around 0
  const absMax = Math.max(Math.abs(minY), Math.abs(maxY));
  minY = -absMax;
  maxY = absMax;

  // Add 10% padding
  const padding = absMax * 0.1;
  minY -= padding;
  maxY += padding;

  // Minimum range
  if (maxY - minY < 10) {
    minY = -50;
    maxY = 50;
  }

  // ✅ Smooth scaling changes
  scalingFrameCount++;

  const smoothingFactor = 0.03;

  if (scalingFrameCount === 1 || cachedMinY === 0) {
    cachedMinY = minY;
    cachedMaxY = maxY;
  } else {
    cachedMinY = cachedMinY * (1 - smoothingFactor) + minY * smoothingFactor;
    cachedMaxY = cachedMaxY * (1 - smoothingFactor) + maxY * smoothingFactor;
  }

  // Scale functions
  const centerY = height / 2;
  const yScale = height / (cachedMaxY - cachedMinY);

  const scaleY = (val: number) => {
    return centerY - (val - (cachedMinY + cachedMaxY) / 2) * yScale;
  };

  const scaleX = (index: number, length: number) => {
    return (index / length) * width;
  };

  const hasNoisy = noiseApplied && noisy.length > 0;

  // ✅ Draw original signal
  ctx.strokeStyle = hasNoisy ? "rgba(102, 126, 234, 0.4)" : "#667eea";
  ctx.lineWidth = hasNoisy ? 2 : 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (let i = 0; i < centeredOriginal.length; i++) {
    const x = scaleX(i, centeredOriginal.length);
    const y = scaleY(centeredOriginal[i]);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // ✅ Draw noisy signal
  if (hasNoisy) {
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    for (let i = 0; i < centeredNoisy.length; i++) {
      const x = scaleX(i, centeredNoisy.length);
      const y = scaleY(centeredNoisy[i]);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

/**
 * Draw labels and legend
 */
function drawLabelsAndLegend(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hasNoise: boolean
) {
  // Axis labels
  ctx.fillStyle = "#666";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Y", 10, 15);
  ctx.textAlign = "right";
  ctx.fillText("Time →", width - 10, height - 10);

  // Legend
  if (hasNoise) {
    const legendX = width - 120;
    const legendY = 10;

    // Original signal
    ctx.fillStyle = "rgba(102, 126, 234, 0.5)";
    ctx.fillRect(legendX, legendY, 15, 3);
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Original", legendX + 20, legendY + 5);

    // Noisy signal
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(legendX, legendY + 15, 15, 3);
    ctx.fillStyle = "#999";
    ctx.fillText("With Noise", legendX + 20, legendY + 20);
  }
}
