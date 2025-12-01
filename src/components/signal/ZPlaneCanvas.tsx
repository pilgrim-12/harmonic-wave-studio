"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ZPlaneData, getUnitCirclePoints } from "@/lib/signal/zplane";

interface ZPlaneCanvasProps {
  zplaneData: ZPlaneData;
  showUnitCircle: boolean;
  showGrid: boolean;
  showFrequencyMarkers: boolean;
  showStabilityRegion: boolean;
  zoomLevel: number;
  sampleRate: number;
}

export const ZPlaneCanvas: React.FC<ZPlaneCanvasProps> = ({
  zplaneData,
  showUnitCircle,
  showGrid,
  showFrequencyMarkers,
  showStabilityRegion,
  zoomLevel,
  sampleRate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !zplaneData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = (size / 2 - 30) / zoomLevel;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Helper to convert complex to canvas coordinates
    const toCanvas = (real: number, imag: number): { x: number; y: number } => ({
      x: centerX + real * scale,
      y: centerY - imag * scale, // Flip Y axis
    });

    // Draw stability region (inside unit circle)
    if (showStabilityRegion) {
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, scale
      );
      gradient.addColorStop(0, "rgba(0, 255, 136, 0.1)");
      gradient.addColorStop(0.8, "rgba(0, 255, 136, 0.05)");
      gradient.addColorStop(1, "rgba(0, 255, 136, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;

      // Radial grid lines
      for (let r = 0.5; r <= zoomLevel; r += 0.5) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * scale, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Angular grid lines (every 45 degrees)
      for (let angle = 0; angle < Math.PI; angle += Math.PI / 4) {
        const r = zoomLevel * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - r * Math.cos(angle), centerY - r * Math.sin(angle));
        ctx.lineTo(centerX + r * Math.cos(angle), centerY + r * Math.sin(angle));
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1.5;

    // Real axis
    ctx.beginPath();
    ctx.moveTo(centerX - zoomLevel * scale, centerY);
    ctx.lineTo(centerX + zoomLevel * scale, centerY);
    ctx.stroke();

    // Imaginary axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - zoomLevel * scale);
    ctx.lineTo(centerX, centerY + zoomLevel * scale);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#666";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Re", centerX + zoomLevel * scale - 15, centerY + 15);
    ctx.fillText("Im", centerX + 15, centerY - zoomLevel * scale + 15);

    // Draw unit circle
    if (showUnitCircle) {
      ctx.strokeStyle = zplaneData.isStable ? "#00ff88" : "#ff6b6b";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label unit circle
      ctx.fillStyle = zplaneData.isStable ? "#00ff88" : "#ff6b6b";
      ctx.font = "10px monospace";
      ctx.fillText("|z| = 1", centerX + scale + 5, centerY - 5);
    }

    // Draw frequency markers on unit circle
    if (showFrequencyMarkers && showUnitCircle) {
      ctx.fillStyle = "#666";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";

      // Key frequency points
      const freqMarkers = [
        { angle: 0, label: "DC" },
        { angle: Math.PI / 4, label: `${(sampleRate / 8).toFixed(0)}Hz` },
        { angle: Math.PI / 2, label: `${(sampleRate / 4).toFixed(0)}Hz` },
        { angle: (3 * Math.PI) / 4, label: `${((3 * sampleRate) / 8).toFixed(0)}Hz` },
        { angle: Math.PI, label: "Nyq" },
      ];

      for (const marker of freqMarkers) {
        const x = centerX + scale * Math.cos(marker.angle);
        const y = centerY - scale * Math.sin(marker.angle);

        // Draw marker dot
        ctx.fillStyle = "#54a0ff";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = "#666";
        const labelOffset = 15;
        const labelX = x + labelOffset * Math.cos(marker.angle);
        const labelY = y - labelOffset * Math.sin(marker.angle);
        ctx.fillText(marker.label, labelX, labelY + 3);
      }
    }

    // Draw zeros (circles)
    ctx.strokeStyle = "#54a0ff";
    ctx.lineWidth = 2;
    const zeroRadius = 8;

    for (const zero of zplaneData.zeros) {
      const { x, y } = toCanvas(zero.real, zero.imag);

      ctx.beginPath();
      ctx.arc(x, y, zeroRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw coordinate tooltip on hover area
      if (Math.abs(zero.imag) > 0.01) {
        ctx.fillStyle = "#54a0ff";
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        ctx.fillText(
          `${zero.real.toFixed(2)}${zero.imag >= 0 ? "+" : ""}${zero.imag.toFixed(2)}j`,
          x + 10,
          y - 5
        );
      }
    }

    // Draw poles (X marks)
    ctx.strokeStyle = "#f093fb";
    ctx.lineWidth = 2.5;
    const poleSize = 8;

    for (const pole of zplaneData.poles) {
      const { x, y } = toCanvas(pole.real, pole.imag);

      // Draw X
      ctx.beginPath();
      ctx.moveTo(x - poleSize, y - poleSize);
      ctx.lineTo(x + poleSize, y + poleSize);
      ctx.moveTo(x + poleSize, y - poleSize);
      ctx.lineTo(x - poleSize, y + poleSize);
      ctx.stroke();

      // Highlight unstable poles
      const mag = Math.sqrt(pole.real ** 2 + pole.imag ** 2);
      if (mag >= 1) {
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, poleSize + 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "#f093fb";
        ctx.lineWidth = 2.5;
      }

      // Draw coordinate
      if (Math.abs(pole.imag) > 0.01) {
        ctx.fillStyle = "#f093fb";
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        ctx.fillText(
          `${pole.real.toFixed(2)}${pole.imag >= 0 ? "+" : ""}${pole.imag.toFixed(2)}j`,
          x + 10,
          y + 12
        );
      }
    }

    // Draw legend
    const legendX = 10;
    const legendY = height - 50;

    ctx.fillStyle = "#333";
    ctx.fillRect(legendX, legendY, 100, 45);
    ctx.strokeStyle = "#444";
    ctx.strokeRect(legendX, legendY, 100, 45);

    // Pole symbol
    ctx.strokeStyle = "#f093fb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 10);
    ctx.lineTo(legendX + 20, legendY + 20);
    ctx.moveTo(legendX + 20, legendY + 10);
    ctx.lineTo(legendX + 10, legendY + 20);
    ctx.stroke();
    ctx.fillStyle = "#f093fb";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Poles", legendX + 28, legendY + 18);

    // Zero symbol
    ctx.strokeStyle = "#54a0ff";
    ctx.beginPath();
    ctx.arc(legendX + 15, legendY + 33, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#54a0ff";
    ctx.fillText("Zeros", legendX + 28, legendY + 37);

    // Stability indicator
    const stabilityX = width - 90;
    const stabilityY = 10;
    ctx.fillStyle = zplaneData.isStable ? "#00ff8833" : "#ff6b6b33";
    ctx.fillRect(stabilityX, stabilityY, 80, 24);
    ctx.strokeStyle = zplaneData.isStable ? "#00ff88" : "#ff6b6b";
    ctx.strokeRect(stabilityX, stabilityY, 80, 24);
    ctx.fillStyle = zplaneData.isStable ? "#00ff88" : "#ff6b6b";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      zplaneData.isStable ? "STABLE" : "UNSTABLE",
      stabilityX + 40,
      stabilityY + 16
    );

    // Scale indicator
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x`, 10, 15);
  }, [zplaneData, showUnitCircle, showGrid, showFrequencyMarkers, showStabilityRegion, zoomLevel, sampleRate]);

  useEffect(() => {
    draw();

    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
