"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { FrequencyResponseData } from "@/lib/signal/frequencyResponse";
import { FrequencyResponseMetrics, ScaleMode } from "@/store/frequencyResponseStore";

interface FrequencyResponseCanvasProps {
  responseData: FrequencyResponseData;
  metrics?: FrequencyResponseMetrics | null;
  mode: "magnitude" | "phase" | "groupDelay";
  frequencyScale?: ScaleMode;
  showGrid?: boolean;
  showMarkers?: boolean;
  showCutoffLine?: boolean;
  height?: number;
  title?: string;
  yAxisLabel?: string;
  color?: string;
}

export const FrequencyResponseCanvas: React.FC<FrequencyResponseCanvasProps> = ({
  responseData,
  metrics,
  mode,
  frequencyScale = "log",
  showGrid = true,
  showMarkers = true,
  showCutoffLine = true,
  height = 0,
  title,
  yAxisLabel,
  color = "#667eea",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number; freq: number; value: number } | null>(null);

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: height > 0 ? height : rect.height,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [height]);

  // Get data based on mode
  const getData = useCallback(() => {
    switch (mode) {
      case "magnitude":
        return responseData.magnitude;
      case "phase":
        return responseData.phaseUnwrapped;
      case "groupDelay":
        return responseData.groupDelay;
      default:
        return responseData.magnitude;
    }
  }, [mode, responseData]);

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !responseData) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isCompact = dimensions.height < 150;
    const padding = isCompact
      ? { left: 50, right: 15, top: 25, bottom: 30 }
      : { left: 60, right: 20, top: 35, bottom: 45 };

    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    if (x < padding.left || x > padding.left + chartWidth) {
      setMousePos(null);
      return;
    }

    const data = getData();
    const frequencies = responseData.frequencies;

    // Find nearest frequency
    const xRatio = (x - padding.left) / chartWidth;
    let freqIndex: number;

    if (frequencyScale === "log") {
      const logMin = Math.log10(frequencies[0]);
      const logMax = Math.log10(frequencies[frequencies.length - 1]);
      const logFreq = logMin + xRatio * (logMax - logMin);
      const targetFreq = Math.pow(10, logFreq);
      freqIndex = frequencies.findIndex(f => f >= targetFreq);
      if (freqIndex < 0) freqIndex = frequencies.length - 1;
    } else {
      freqIndex = Math.round(xRatio * (frequencies.length - 1));
    }

    freqIndex = Math.max(0, Math.min(freqIndex, frequencies.length - 1));

    setMousePos({
      x,
      y,
      freq: frequencies[freqIndex],
      value: data[freqIndex],
    });
  }, [dimensions, responseData, getData, frequencyScale]);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const data = getData();
    const frequencies = responseData.frequencies;

    if (data.length === 0 || frequencies.length === 0) return;

    // Adaptive padding
    const isCompact = dimensions.height < 150;
    const padding = isCompact
      ? { left: 50, right: 15, top: 25, bottom: 30 }
      : { left: 60, right: 20, top: 35, bottom: 45 };

    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Calculate Y range
    let minY = Math.min(...data.filter(v => isFinite(v)));
    let maxY = Math.max(...data.filter(v => isFinite(v)));

    // Add padding to Y range
    const yPadding = (maxY - minY) * 0.1 || 1;
    minY -= yPadding;
    maxY += yPadding;

    // For magnitude, show at least down to -60 dB
    if (mode === "magnitude") {
      minY = Math.min(minY, -60);
      maxY = Math.max(maxY, 5);
    }

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, padding, chartWidth, chartHeight, frequencies, minY, maxY, frequencyScale, isCompact);
    }

    // Draw -3dB line for magnitude
    if (mode === "magnitude" && showCutoffLine && metrics?.dcGain !== undefined) {
      const y3dB = padding.top + ((maxY - (metrics.dcGain - 3)) / (maxY - minY)) * chartHeight;
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y3dB);
      ctx.lineTo(padding.left + chartWidth, y3dB);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("-3dB", padding.left + 5, y3dB - 3);
    }

    // Draw cutoff frequency marker
    if (showMarkers && metrics?.cutoff3dB && mode === "magnitude") {
      const cutoffFreq = metrics.cutoff3dB;
      let xCutoff: number;

      if (frequencyScale === "log") {
        const logMin = Math.log10(frequencies[0]);
        const logMax = Math.log10(frequencies[frequencies.length - 1]);
        const logCutoff = Math.log10(cutoffFreq);
        xCutoff = padding.left + ((logCutoff - logMin) / (logMax - logMin)) * chartWidth;
      } else {
        xCutoff = padding.left + ((cutoffFreq - frequencies[0]) / (frequencies[frequencies.length - 1] - frequencies[0])) * chartWidth;
      }

      ctx.strokeStyle = "#feca57";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xCutoff, padding.top);
      ctx.lineTo(xCutoff, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = "#feca57";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`fc=${cutoffFreq.toFixed(2)}Hz`, xCutoff, padding.top - 5);
    }

    // Draw response curve
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let firstPoint = true;
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (!isFinite(value)) continue;

      let x: number;
      if (frequencyScale === "log") {
        const logMin = Math.log10(frequencies[0]);
        const logMax = Math.log10(frequencies[frequencies.length - 1]);
        const logFreq = Math.log10(frequencies[i]);
        x = padding.left + ((logFreq - logMin) / (logMax - logMin)) * chartWidth;
      } else {
        x = padding.left + (i / (data.length - 1)) * chartWidth;
      }

      const y = padding.top + ((maxY - value) / (maxY - minY)) * chartHeight;

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill under curve (gradient)
    ctx.beginPath();
    firstPoint = true;
    let lastX = padding.left;
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (!isFinite(value)) continue;

      let x: number;
      if (frequencyScale === "log") {
        const logMin = Math.log10(frequencies[0]);
        const logMax = Math.log10(frequencies[frequencies.length - 1]);
        const logFreq = Math.log10(frequencies[i]);
        x = padding.left + ((logFreq - logMin) / (logMax - logMin)) * chartWidth;
      } else {
        x = padding.left + (i / (data.length - 1)) * chartWidth;
      }

      const y = padding.top + ((maxY - value) / (maxY - minY)) * chartHeight;

      if (firstPoint) {
        ctx.moveTo(x, padding.top + chartHeight);
        ctx.lineTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
      lastX = x;
    }
    ctx.lineTo(lastX, padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "05");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw axes
    drawAxes(ctx, padding, chartWidth, chartHeight, frequencies, minY, maxY, frequencyScale, isCompact, mode, yAxisLabel);

    // Draw title
    if (title && !isCompact) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, dimensions.width / 2, 18);
    }

    // Draw cursor
    if (mousePos) {
      // Vertical line
      ctx.strokeStyle = "#ffffff60";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, padding.top + chartHeight);
      ctx.stroke();

      // Value tooltip
      const tooltipText = mode === "magnitude"
        ? `${mousePos.freq.toFixed(2)} Hz: ${mousePos.value.toFixed(2)} dB`
        : mode === "phase"
          ? `${mousePos.freq.toFixed(2)} Hz: ${mousePos.value.toFixed(1)}°`
          : `${mousePos.freq.toFixed(2)} Hz: ${mousePos.value.toFixed(3)} samples`;

      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(mousePos.x + 5, mousePos.y - 20, ctx.measureText(tooltipText).width + 10, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(tooltipText, mousePos.x + 10, mousePos.y - 7);
    }
  }, [responseData, dimensions, getData, mode, frequencyScale, showGrid, showMarkers, showCutoffLine, metrics, color, mousePos, title, yAxisLabel]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg border border-[#2a2a2a]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

/**
 * Draw grid lines
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  chartHeight: number,
  frequencies: number[],
  minY: number,
  maxY: number,
  frequencyScale: ScaleMode,
  isCompact: boolean
) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  // Horizontal grid lines (Y axis)
  const ySteps = isCompact ? 3 : 5;
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + (chartHeight / ySteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Vertical grid lines (frequency)
  if (frequencyScale === "log") {
    // Logarithmic grid
    const minFreq = frequencies[0];
    const maxFreq = frequencies[frequencies.length - 1];
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);

    // Draw decade lines
    const startDecade = Math.floor(logMin);
    const endDecade = Math.ceil(logMax);

    for (let decade = startDecade; decade <= endDecade; decade++) {
      const freq = Math.pow(10, decade);
      if (freq < minFreq || freq > maxFreq) continue;

      const x = padding.left + ((decade - logMin) / (logMax - logMin)) * chartWidth;

      ctx.strokeStyle = "#222";
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();

      // Sub-decade lines (2, 3, 5)
      if (!isCompact) {
        [2, 3, 5].forEach(mult => {
          const subFreq = freq * mult;
          if (subFreq < minFreq || subFreq > maxFreq) return;
          const subX = padding.left + ((Math.log10(subFreq) - logMin) / (logMax - logMin)) * chartWidth;
          ctx.strokeStyle = "#181818";
          ctx.beginPath();
          ctx.moveTo(subX, padding.top);
          ctx.lineTo(subX, padding.top + chartHeight);
          ctx.stroke();
        });
      }
    }
  } else {
    // Linear grid
    const freqSteps = isCompact ? 5 : 10;
    for (let i = 0; i <= freqSteps; i++) {
      const x = padding.left + (chartWidth / freqSteps) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
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
  frequencies: number[],
  minY: number,
  maxY: number,
  frequencyScale: ScaleMode,
  isCompact: boolean,
  mode: string,
  yAxisLabel?: string
) {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = isCompact ? 1 : 2;

  // X axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();

  const fontSize = isCompact ? 9 : 10;
  const titleSize = isCompact ? 10 : 11;

  // X axis labels (frequency)
  ctx.fillStyle = "#888";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";

  const minFreq = frequencies[0];
  const maxFreq = frequencies[frequencies.length - 1];

  if (frequencyScale === "log") {
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const startDecade = Math.floor(logMin);
    const endDecade = Math.ceil(logMax);

    for (let decade = startDecade; decade <= endDecade; decade++) {
      const freq = Math.pow(10, decade);
      if (freq < minFreq || freq > maxFreq) continue;

      const x = padding.left + ((decade - logMin) / (logMax - logMin)) * chartWidth;
      const label = freq >= 1 ? freq.toFixed(0) : freq.toFixed(2);
      ctx.fillText(label, x, padding.top + chartHeight + (isCompact ? 12 : 15));
    }
  } else {
    const numLabels = isCompact ? 3 : 5;
    for (let i = 0; i <= numLabels; i++) {
      const freq = minFreq + (maxFreq - minFreq) * (i / numLabels);
      const x = padding.left + (chartWidth / numLabels) * i;
      ctx.fillText(freq.toFixed(1), x, padding.top + chartHeight + (isCompact ? 12 : 15));
    }
  }

  // X axis title
  if (!isCompact) {
    ctx.fillStyle = "#667eea";
    ctx.font = `${titleSize}px sans-serif`;
    ctx.fillText("Frequency (Hz)", padding.left + chartWidth / 2, padding.top + chartHeight + 35);
  }

  // Y axis labels
  ctx.textAlign = "right";
  ctx.fillStyle = "#888";
  ctx.font = `${fontSize}px sans-serif`;

  const ySteps = isCompact ? 3 : 5;
  for (let i = 0; i <= ySteps; i++) {
    const value = maxY - ((maxY - minY) / ySteps) * i;
    const y = padding.top + (chartHeight / ySteps) * i;

    let label: string;
    if (mode === "magnitude") {
      label = value.toFixed(0);
    } else if (mode === "phase") {
      label = value.toFixed(0) + "°";
    } else {
      label = value.toFixed(2);
    }

    ctx.fillText(label, padding.left - 5, y + 3);
  }

  // Y axis title
  if (!isCompact) {
    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#667eea";
    ctx.font = `${titleSize}px sans-serif`;
    ctx.textAlign = "center";

    const label = yAxisLabel || (mode === "magnitude" ? "Magnitude (dB)" : mode === "phase" ? "Phase (°)" : "Group Delay (samples)");
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
}
