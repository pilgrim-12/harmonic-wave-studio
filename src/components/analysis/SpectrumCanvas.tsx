"use client";

import React, { useRef, useEffect } from "react";
import { FrequencySpectrum } from "@/types/fourier";

interface SpectrumCanvasProps {
  spectrum: FrequencySpectrum;
  maxFrequency?: number;
  height?: number;
  showGrid?: boolean;
}

export const SpectrumCanvas: React.FC<SpectrumCanvasProps> = ({
  spectrum,
  maxFrequency = 10, // Show up to 10 Hz by default
  height = 200,
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Set canvas size
    canvas.width = parent.clientWidth;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spectrum
    drawSpectrum(
      ctx,
      canvas.width,
      canvas.height,
      spectrum,
      maxFrequency,
      showGrid
    );
  }, [spectrum, maxFrequency, height, showGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-[#2a2a2a]"
      style={{ height: `${height}px` }}
    />
  );
};

/**
 * Draw frequency spectrum as bar chart
 */
function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spectrum: FrequencySpectrum,
  maxFreq: number,
  showGrid: boolean
) {
  const { frequencies, amplitudes } = spectrum;

  // Filter frequencies up to maxFreq
  const filteredData: Array<{ freq: number; amp: number }> = [];

  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] <= maxFreq && frequencies[i] > 0) {
      // Skip DC (0 Hz)
      filteredData.push({
        freq: frequencies[i],
        amp: amplitudes[i],
      });
    }
  }

  if (filteredData.length === 0) return;

  // Find max amplitude for scaling
  const maxAmp = Math.max(...filteredData.map((d) => d.amp));
  if (maxAmp === 0) return;

  // Layout parameters
  const padding = { left: 45, right: 20, top: 20, bottom: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Draw grid (optional)
  if (showGrid) {
    drawGrid(ctx, padding, chartWidth, chartHeight, maxAmp);
  }

  // Draw axes
  drawAxes(ctx, padding, chartWidth, chartHeight, maxFreq, maxAmp);

  // Draw bars
  const barWidth = Math.max(1, chartWidth / filteredData.length);

  for (let i = 0; i < filteredData.length; i++) {
    const { freq, amp } = filteredData[i];

    // Calculate bar position and height
    const x = padding.left + (freq / maxFreq) * chartWidth;
    const barHeight = (amp / maxAmp) * chartHeight;
    const y = padding.top + chartHeight - barHeight;

    // Color based on frequency (rainbow: blue -> cyan -> green -> yellow -> red)
    const hue = 240 - (freq / maxFreq) * 180; // 240 (blue) to 60 (yellow)
    const color = `hsl(${hue}, 70%, 60%)`;

    // Draw bar with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustBrightness(color, -20));

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, Math.max(2, barWidth - 1), barHeight);

    // Highlight peak bars (top 20%)
    if (amp > maxAmp * 0.8) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, Math.max(2, barWidth - 1), barHeight);
    }
  }
}

/**
 * Draw grid lines
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  chartHeight: number,
  maxAmp: number
) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  // Horizontal grid lines (amplitude)
  const ampSteps = 5;
  for (let i = 0; i <= ampSteps; i++) {
    const y = padding.top + (chartHeight / ampSteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Vertical grid lines (frequency)
  const freqSteps = 10;
  for (let i = 0; i <= freqSteps; i++) {
    const x = padding.left + (chartWidth / freqSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();
  }
}

/**
 * Draw axes with labels
 */
function drawAxes(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  chartHeight: number,
  maxFreq: number,
  maxAmp: number
) {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;

  // X axis (frequency)
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.stroke();

  // Y axis (amplitude)
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();

  // X axis labels (frequency)
  ctx.fillStyle = "#888";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";

  const freqLabels = [0, maxFreq / 4, maxFreq / 2, (3 * maxFreq) / 4, maxFreq];
  freqLabels.forEach((freq) => {
    const x = padding.left + (freq / maxFreq) * chartWidth;
    const y = padding.top + chartHeight + 15;
    ctx.fillText(`${freq.toFixed(1)}`, x, y);
  });

  // X axis title
  ctx.fillStyle = "#667eea";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Frequency (Hz)",
    padding.left + chartWidth / 2,
    padding.top + chartHeight + 35
  );

  // Y axis labels (amplitude)
  ctx.textAlign = "right";
  ctx.fillStyle = "#888";
  ctx.font = "10px sans-serif";

  const ampLabels = [0, maxAmp / 2, maxAmp];
  ampLabels.forEach((amp, index) => {
    const y =
      padding.top +
      chartHeight -
      (index / (ampLabels.length - 1)) * chartHeight;
    ctx.fillText(amp.toFixed(4), padding.left - 5, y + 3);
  });

  // Y axis title (rotated)
  ctx.save();
  ctx.translate(15, padding.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#667eea";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Amplitude", 0, 0);
  ctx.restore();
}

/**
 * Adjust color brightness
 */
function adjustBrightness(hslColor: string, percent: number): string {
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;

  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = Math.max(0, Math.min(100, parseInt(match[3]) + percent));

  return `hsl(${h}, ${s}%, ${l}%)`;
}
