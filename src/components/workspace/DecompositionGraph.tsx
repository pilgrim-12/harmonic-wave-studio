"use client";

import React, { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";

export const DecompositionGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { radii } = useRadiusStore();
  const { currentTime, settings } = useSimulationStore();

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
    const padding = { left: 40, right: 20, top: 30, bottom: 30 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Calculate Y range based on all components
    let maxY = 0;
    radii.forEach((radius) => {
      maxY = Math.max(maxY, Math.abs(radius.length));
    });

    // Add padding to range
    const yRange = maxY * 1.2 || 100;

    // Helper: time to X coordinate
    const timeToX = (t: number) => {
      const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
      return padding.left + normalizedTime * graphWidth;
    };

    // Helper: Y value to canvas Y coordinate
    const yToCanvas = (y: number) => {
      return padding.top + graphHeight / 2 - (y / yRange) * (graphHeight / 2);
    };

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = -2; i <= 2; i++) {
      const y = yToCanvas(i * (yRange / 2));
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
    ctx.moveTo(padding.left, yToCanvas(0));
    ctx.lineTo(width - padding.right, yToCanvas(0));
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
      const y = yToCanvas(value);
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

    // Title
    ctx.fillStyle = "#667eea";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Signal Decomposition", padding.left, 8);

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

    // Draw sum (combined signal) as thick white line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();

    let firstPoint = true;

    for (let i = 0; i <= numSamples; i++) {
      const t = currentTime - graphDuration + i * dt;

      if (t < 0) continue;

      // Calculate sum of all components
      // IMPORTANT: We need cumulative angles because radii are chained
      let y = 0;
      let cumulativeAngle = 0;

      for (const radius of radii) {
        const direction = radius.direction === "counterclockwise" ? 1 : -1;
        const angle = radius.initialAngle + direction * radius.rotationSpeed * t * 2 * Math.PI;
        cumulativeAngle += angle;
        y += radius.length * Math.sin(cumulativeAngle);
      }

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

  }, [radii, currentTime, settings.graphDuration]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-bold text-white">Signal Decomposition</h3>
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
