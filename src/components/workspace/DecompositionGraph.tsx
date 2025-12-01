"use client";

import React, { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

export const DecompositionGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { radii } = useRadiusStore();
  const { currentTime, settings } = useSimulationStore();
  const signalBufferLength = useSignalProcessingStore(
    (state) => state.signalBuffer.length
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    if (radii.length === 0) {
      // Empty state
      ctx.fillStyle = "#666";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No radii to decompose", width / 2, height / 2 - 10);
      ctx.fillStyle = "#555";
      ctx.font = "10px sans-serif";
      ctx.fillText("Add radii to see signal components", width / 2, height / 2 + 10);
      return;
    }

    // Graph settings
    const graphDuration = settings.graphDuration;
    const padding = { left: 40, right: 20, top: 15, bottom: 30 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Get scale from signalProcessingStore to match other graphs
    const { scale } = useSignalProcessingStore.getState();
    const { minY, maxY } = scale;
    const yRange = Math.max(Math.abs(maxY), Math.abs(minY)) * 1.2 || 100;

    // Helper: time to X coordinate
    const timeToX = (t: number) => {
      const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
      return padding.left + normalizedTime * graphWidth;
    };

    // Helper: Y value to canvas Y coordinate for grid/axes (no centering)
    const yToCanvasGrid = (y: number) => {
      return padding.top + graphHeight / 2 - (y / yRange) * (graphHeight / 2);
    };

    // Helper: Y value to canvas Y coordinate for signals (centered around avgY)
    const yToCanvas = (y: number) => {
      const centered = y - scale.avgY;
      return padding.top + graphHeight / 2 - (centered / yRange) * (graphHeight / 2);
    };

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = -2; i <= 2; i++) {
      const y = yToCanvasGrid(i * (yRange / 2));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines (time)
    const timeStep = graphDuration / 5;
    for (let i = 0; i <= 5; i++) {
      const t = currentTime - graphDuration + i * timeStep;
      const x = timeToX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    // X axis (time)
    ctx.beginPath();
    ctx.moveTo(padding.left, yToCanvasGrid(0));
    ctx.lineTo(width - padding.right, yToCanvasGrid(0));
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Y axis labels
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = -2; i <= 2; i++) {
      const value = i * (yRange / 2);
      const y = yToCanvasGrid(value);
      ctx.fillText(value.toFixed(0), padding.left - 5, y);
    }

    // Time labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 5; i++) {
      const t = currentTime - graphDuration + i * timeStep;
      const x = timeToX(t);
      ctx.fillText(t.toFixed(1) + "s", x, height - padding.bottom + 5);
    }

    // Draw each radius component
    const numSamples = 500;
    const dt = graphDuration / numSamples;

    radii.forEach((radius, index) => {
      const direction = radius.direction === "counterclockwise" ? 1 : -1;
      const omega = direction * radius.rotationSpeed * 2 * Math.PI;

      ctx.strokeStyle = radius.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();

      let firstPoint = true;

      for (let i = 0; i <= numSamples; i++) {
        const t = currentTime - graphDuration + i * dt;

        if (t < 0) continue;

        // Calculate Y value for this radius ONLY
        // Formula: y = A * sin(ω*t + φ)
        const y = radius.length * Math.sin(omega * t + radius.initialAngle);

        const x = timeToX(t);
        const canvasY = yToCanvas(y);

        if (firstPoint) {
          ctx.moveTo(x, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(x, canvasY);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // Draw sum (original signal from signalBuffer) as thick white line
    const { signalBuffer } = useSignalProcessingStore.getState();

    if (signalBuffer.length > 1) {
      // Set up clipping region for the graph area
      ctx.save();
      ctx.beginPath();
      ctx.rect(padding.left, padding.top, graphWidth, graphHeight);
      ctx.clip();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();

      let firstPoint = true;

      for (let i = 0; i < signalBuffer.length; i++) {
        const point = signalBuffer[i];
        const x = timeToX(point.time);
        const canvasY = yToCanvas(point.y);

        if (firstPoint) {
          ctx.moveTo(x, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(x, canvasY);
        }
      }

      ctx.stroke();

      // Current point dot for sum signal
      if (signalBuffer.length > 0) {
        const lastPoint = signalBuffer[signalBuffer.length - 1];
        const dotX = timeToX(lastPoint.time);
        const dotY = yToCanvas(lastPoint.y);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    // Legend
    const legendX = width - padding.right - 150;
    const legendY = padding.top + 10;
    const legendLineHeight = 16;

    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    radii.forEach((radius, index) => {
      const y = legendY + index * legendLineHeight;

      // Color line
      ctx.strokeStyle = radius.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legendX, y);
      ctx.lineTo(legendX + 20, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = radius.color;
      const label = `${radius.name}: A=${radius.length.toFixed(0)} f=${radius.rotationSpeed.toFixed(1)}Hz`;
      ctx.fillText(label, legendX + 25, y);
    });

    // Sum label
    const sumY = legendY + radii.length * legendLineHeight;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, sumY);
    ctx.lineTo(legendX + 20, sumY);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Sum (Total)", legendX + 25, sumY);

  }, [radii, currentTime, settings.graphDuration, signalBufferLength]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-bold text-[#667eea]">Signal Decomposition</h3>
        </div>
        <span className="text-xs text-gray-400">{radii.length} component{radii.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};
