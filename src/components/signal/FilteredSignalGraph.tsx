"use client";

import React, { useRef, useEffect } from "react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";

export const FilteredSignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { original, noisy, noiseApplied } = useSignalProcessingStore();
  const { filteredSignal, isFilterApplied } = useFilterStore();

  // Smooth interpolation refs
  const smoothedFilteredRef = useRef<number[]>([]);
  const prevFilteredRef = useRef<number[]>([]);
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

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Track filtered signal changes and start interpolation
  useEffect(() => {
    if (filteredSignal.length === 0) {
      smoothedFilteredRef.current = [];
      prevFilteredRef.current = [];
      interpolationStateRef.current.isInterpolating = false;
      return;
    }

    const prevFiltered = prevFilteredRef.current;

    // If no previous signal, use current immediately
    if (
      prevFiltered.length === 0 ||
      prevFiltered.length !== filteredSignal.length
    ) {
      smoothedFilteredRef.current = [...filteredSignal];
      prevFilteredRef.current = [...filteredSignal];
      interpolationStateRef.current.isInterpolating = false;
      return;
    }

    // Start interpolation
    interpolationStateRef.current = {
      isInterpolating: true,
      startTime: performance.now(),
      startValues: [...prevFiltered],
      endValues: [...filteredSignal],
    };
  }, [filteredSignal]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (timestamp: number) => {
      const width = canvas.width;
      const height = canvas.height;

      // Handle interpolation
      const interpState = interpolationStateRef.current;
      if (interpState.isInterpolating) {
        const elapsed = timestamp - interpState.startTime;
        const duration = 300; // 300ms transition
        const progress = Math.min(1, elapsed / duration);

        if (progress >= 1) {
          // Interpolation complete
          smoothedFilteredRef.current = [...interpState.endValues];
          prevFilteredRef.current = [...interpState.endValues];
          interpState.isInterpolating = false;
        } else {
          // Ease-out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          smoothedFilteredRef.current = interpState.endValues.map(
            (endVal, i) => {
              const startVal = interpState.startValues[i] || endVal;
              return startVal + (endVal - startVal) * easedProgress;
            }
          );
        }
      }

      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      drawGrid(ctx, width, height);

      // Draw signals if available
      if (
        original.length > 0 ||
        noisy.length > 0 ||
        smoothedFilteredRef.current.length > 0
      ) {
        drawSignals(
          ctx,
          width,
          height,
          original.length > 0 ? original : noisy,
          noisy,
          smoothedFilteredRef.current,
          noiseApplied,
          isFilterApplied
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
      drawLabelsAndLegend(ctx, width, height, noiseApplied, isFilterApplied);

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
  }, [original, noisy, filteredSignal, noiseApplied, isFilterApplied]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Signal Comparison
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
 * Draw all signals with smooth scaling
 */
function drawSignals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  original: number[],
  noisy: number[],
  filtered: number[],
  hasNoisy: boolean,
  hasFiltered: boolean
) {
  // Use noisy as baseline
  if (!hasNoisy || noisy.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Apply noise first", width / 2, height / 2);
    return;
  }

  // Center noisy signal
  const avgNoisy = noisy.reduce((sum, val) => sum + val, 0) / noisy.length;
  const centeredNoisy = noisy.map((val) => val - avgNoisy);

  // Center original signal
  let centeredOriginal: number[] = [];
  if (original.length > 0) {
    const avgOriginal =
      original.reduce((sum, val) => sum + val, 0) / original.length;
    centeredOriginal = original.map((val) => val - avgOriginal);
  }

  // Center filtered signal - NO SCALING
  let centeredFiltered: number[] = [];
  if (hasFiltered && filtered.length > 0) {
    const avgFiltered =
      filtered.reduce((sum, val) => sum + val, 0) / filtered.length;
    centeredFiltered = filtered.map((val) => val - avgFiltered);
  }

  // Find min/max from BOTH noisy AND filtered to show all data
  const allSignals = [...centeredNoisy];
  if (centeredFiltered.length > 0) {
    allSignals.push(...centeredFiltered);
  }

  const minY = Math.min(...allSignals) * 1.1;
  const maxY = Math.max(...allSignals) * 1.1;

  // Scale functions
  const centerY = height / 2;
  const yScale = height / (maxY - minY);

  const scaleY = (val: number) => {
    return centerY - (val - (minY + maxY) / 2) * yScale;
  };

  const scaleX = (index: number, length: number) => {
    return (index / (length - 1)) * width;
  };

  // Draw original signal (thin, very transparent)
  if (centeredOriginal.length > 0) {
    ctx.strokeStyle = "rgba(102, 126, 234, 0.25)";
    ctx.lineWidth = 1.5;
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
  }

  // Draw noisy signal (red, medium)
  ctx.strokeStyle = "rgba(255, 107, 107, 0.6)";
  ctx.lineWidth = 1.5;
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

  // Draw filtered signal (green, THICK and BRIGHT)
  if (hasFiltered && centeredFiltered.length > 0) {
    ctx.strokeStyle = "#22c55e"; // Brighter green
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    for (let i = 0; i < centeredFiltered.length; i++) {
      const x = scaleX(i, centeredFiltered.length);
      const y = scaleY(centeredFiltered[i]);

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
  hasNoisy: boolean,
  hasFiltered: boolean
) {
  // Axis labels
  ctx.fillStyle = "#666";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Y", 10, 15);
  ctx.textAlign = "right";
  ctx.fillText("Time →", width - 10, height - 10);

  // Legend
  const legendX = width - 130;
  const legendY = 10;
  let currentY = legendY;

  // Original signal
  ctx.fillStyle = "rgba(102, 126, 234, 0.25)";
  ctx.fillRect(legendX, currentY, 15, 3);
  ctx.fillStyle = "#999";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Original", legendX + 20, currentY + 5);
  currentY += 15;

  // Noisy signal
  if (hasNoisy) {
    ctx.fillStyle = "rgba(255, 107, 107, 0.6)";
    ctx.fillRect(legendX, currentY, 15, 3);
    ctx.fillStyle = "#999";
    ctx.fillText("With Noise", legendX + 20, currentY + 5);
    currentY += 15;
  }

  // Filtered signal
  if (hasFiltered) {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(legendX, currentY, 15, 3);
    ctx.fillStyle = "#999";
    ctx.fillText("Filtered", legendX + 20, currentY + 5);
  }
}
