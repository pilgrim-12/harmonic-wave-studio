"use client";

import React, { useRef, useEffect } from "react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import {
  calculateRadiusPositions,
  getFinalPoint,
} from "@/lib/canvas/calculator";

// ⭐ Cache for smooth scaling (avoid jitter)
let cachedMinY = 0;
let cachedMaxY = 0;
let scalingFrameCount = 0;

export const SignalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signalDataRef = useRef<{ time: number; y: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const { radii } = useRadiusStore();
  const {
    isPlaying,
    currentTime,
    settings,
    activeTrackingRadiusId,
    setSignalData,
  } = useSimulationStore();

  // Initialize canvas
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

  // Reset data when radii or active radius changes
  useEffect(() => {
    signalDataRef.current = [];
    setSignalData([]);
    // Reset scaling cache
    scalingFrameCount = 0;
    cachedMinY = 0;
    cachedMaxY = 0;
  }, [radii, activeTrackingRadiusId, setSignalData]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      // Throttle: Update data every frame, but render every 3rd frame
      frameCountRef.current++;
      const shouldRender = frameCountRef.current % 3 === 0;

      // ALWAYS collect data (not throttled)
      if (isPlaying && radii.length > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Calculate positions
        const positions = calculateRadiusPositions(
          radii,
          centerX,
          centerY,
          currentTime
        );

        // Determine which point to track
        let finalPoint = null;

        if (activeTrackingRadiusId) {
          const trackingPosition = positions.find(
            (pos) => pos.radiusId === activeTrackingRadiusId
          );
          finalPoint = trackingPosition?.endPoint || null;
        } else {
          finalPoint = getFinalPoint(positions);
        }

        if (finalPoint) {
          const y = centerY - finalPoint.y;

          signalDataRef.current.push({
            time: currentTime,
            y: y,
          });

          // Limit data points by time
          const maxTime = settings.graphDuration;
          signalDataRef.current = signalDataRef.current.filter(
            (point) => currentTime - point.time <= maxTime
          );

          setSignalData(signalDataRef.current);
        }
      }

      // RENDER only every 3rd frame (throttled)
      if (shouldRender) {
        // Clear
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ✅ Draw grid FIRST (behind everything)
        drawGrid(ctx, canvas.width, canvas.height);

        // Draw signal OR placeholder
        if (signalDataRef.current.length > 1) {
          drawSignal(
            ctx,
            signalDataRef.current,
            canvas.width,
            canvas.height,
            currentTime,
            settings.graphDuration
          );
        } else {
          // ✅ Show placeholder when no data
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("No signal data", canvas.width / 2, canvas.height / 2);
          ctx.fillText(
            "Start animation to see signals",
            canvas.width / 2,
            canvas.height / 2 + 20
          );
        }

        // ✅ Draw labels and legend LAST (on top)
        drawLabelsAndLegend(ctx, canvas.width, canvas.height);
      }

      // Next frame
      // ✅ ВСЕГДА продолжаем animation loop (даже когда остановлено)
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPlaying,
    radii,
    currentTime,
    settings.graphDuration,
    activeTrackingRadiusId,
    setSignalData,
  ]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Original Signal
      </div>
    </div>
  );
};

/**
 * ✅ NEW: Draw grid (like NoisySignalGraph)
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

  // Center line (Y = 0) - thicker
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

/**
 * ✅ NEW: Draw labels and legend
 */
function drawLabelsAndLegend(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Axis labels
  ctx.fillStyle = "#666";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Y", 10, 15);
  ctx.textAlign = "right";
  ctx.fillText("Time →", width - 10, height - 10);

  // Legend
  const legendX = width - 100;
  const legendY = 10;

  // Signal line
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(legendX, legendY + 2);
  ctx.lineTo(legendX + 15, legendY + 2);
  ctx.stroke();

  // Signal label
  ctx.fillStyle = "#999";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Signal", legendX + 20, legendY + 5);
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

  // ✅ FIX 1: Remove DC offset (center the signal)
  // Calculate average Y value
  let sumY = 0;
  for (const point of data) {
    sumY += point.y;
  }
  const avgY = sumY / data.length; // This is the DC offset

  // ✅ FIX 2: Find min/max AFTER removing DC offset
  let minY = Infinity;
  let maxY = -Infinity;
  const step = Math.max(1, Math.floor(data.length / 100));
  for (let i = 0; i < data.length; i += step) {
    const centeredY = data[i].y - avgY; // Remove DC offset
    minY = Math.min(minY, centeredY);
    maxY = Math.max(maxY, centeredY);
  }

  // ✅ FIX 3: Use symmetric range around 0
  const absMax = Math.max(Math.abs(minY), Math.abs(maxY));
  minY = -absMax;
  maxY = absMax;

  // Add 10% padding
  const padding = absMax * 0.1;
  minY -= padding;
  maxY += padding;

  // If range too small, use fixed
  if (maxY - minY < 10) {
    minY = -50;
    maxY = 50;
  }

  // ✅ FIX 4: Smooth scaling changes (exponential moving average)
  scalingFrameCount++;
  const smoothingFactor = 0.1; // Lower = smoother but slower adaptation

  if (scalingFrameCount === 1) {
    // First frame - initialize
    cachedMinY = minY;
    cachedMaxY = maxY;
  } else {
    // Smooth transition
    cachedMinY = cachedMinY * (1 - smoothingFactor) + minY * smoothingFactor;
    cachedMaxY = cachedMaxY * (1 - smoothingFactor) + maxY * smoothingFactor;
  }

  const centerY = height / 2;
  const timeScale = (width - 100) / graphDuration;
  const currentX = width - 50;
  const yScale = height / (cachedMaxY - cachedMinY);

  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let firstPoint = true;

  for (const point of data) {
    const x = currentX - (currentTime - point.time) * timeScale;
    // ✅ FIX 5: Use centered Y and cached scaling
    const centeredY = point.y - avgY;
    const y = centerY - (centeredY - (cachedMinY + cachedMaxY) / 2) * yScale;

    if (x < 0) continue;

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Current value point
  if (data.length > 0) {
    const lastPoint = data[data.length - 1];
    const lastX = currentX - (currentTime - lastPoint.time) * timeScale;
    const centeredY = lastPoint.y - avgY;
    const lastY =
      centerY - (centeredY - (cachedMinY + cachedMaxY) / 2) * yScale;

    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}
