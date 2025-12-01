"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { PWMSignalData } from "@/lib/signal/pwmGenerator";

interface PWMCanvasProps {
  signalData: PWMSignalData;
  timeWindow?: number;
  showCarrier?: boolean;
  showModulating?: boolean;
  showPWM?: boolean;
  showAverage?: boolean;
  height?: number;
}

export const PWMCanvas: React.FC<PWMCanvasProps> = ({
  signalData,
  timeWindow = 0.05,
  showCarrier = true,
  showModulating = true,
  showPWM = true,
  showAverage = true,
  height = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; time: number; duty: number } | null>(null);

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

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !signalData) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const isCompact = dimensions.height < 150;
    const padding = isCompact
      ? { left: 45, right: 10, top: 15, bottom: 25 }
      : { left: 55, right: 15, top: 25, bottom: 40 };

    const chartWidth = dimensions.width - padding.left - padding.right;

    if (x < padding.left || x > padding.left + chartWidth) {
      setMousePos(null);
      return;
    }

    const xRatio = (x - padding.left) / chartWidth;
    const timeIndex = Math.floor(xRatio * Math.min(signalData.time.length, Math.floor(timeWindow * signalData.time.length / (signalData.time[signalData.time.length - 1] || 1))));
    const clampedIndex = Math.max(0, Math.min(timeIndex, signalData.time.length - 1));

    setMousePos({
      x,
      time: signalData.time[clampedIndex],
      duty: signalData.dutyCycleOverTime[clampedIndex],
    });
  }, [dimensions, signalData, timeWindow]);

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

    const { time, pwmSignal, modulatingSignal, averageSignal, dutyCycleOverTime } = signalData;

    if (time.length === 0) return;

    // Adaptive padding
    const isCompact = dimensions.height < 150;
    const padding = isCompact
      ? { left: 45, right: 10, top: 15, bottom: 25 }
      : { left: 55, right: 15, top: 25, bottom: 40 };

    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Calculate display range
    const totalDuration = time[time.length - 1];
    const displaySamples = Math.min(time.length, Math.floor(time.length * timeWindow / totalDuration));
    const startIndex = 0;
    const endIndex = Math.min(startIndex + displaySamples, time.length);

    // Draw grid
    drawGrid(ctx, padding, chartWidth, chartHeight, isCompact);

    // Draw duty cycle reference lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [0.25, 0.5, 0.75].forEach(duty => {
      const y = padding.top + chartHeight * (1 - duty);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw modulating signal
    if (showModulating && modulatingSignal.length > 0) {
      const modMin = Math.min(...modulatingSignal.slice(startIndex, endIndex));
      const modMax = Math.max(...modulatingSignal.slice(startIndex, endIndex));
      const modRange = modMax - modMin || 1;

      ctx.strokeStyle = "#f093fb";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = startIndex; i < endIndex; i++) {
        const x = padding.left + ((i - startIndex) / (endIndex - startIndex - 1)) * chartWidth;
        const normalizedValue = (modulatingSignal[i] - modMin) / modRange;
        const y = padding.top + chartHeight * (1 - normalizedValue);

        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw carrier (duty cycle threshold)
    if (showCarrier) {
      ctx.strokeStyle = "#54a0ff40";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = startIndex; i < endIndex; i++) {
        const x = padding.left + ((i - startIndex) / (endIndex - startIndex - 1)) * chartWidth;
        const y = padding.top + chartHeight * (1 - dutyCycleOverTime[i]);

        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw PWM signal (digital)
    if (showPWM) {
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.beginPath();

      let lastY = padding.top + chartHeight;
      for (let i = startIndex; i < endIndex; i++) {
        const x = padding.left + ((i - startIndex) / (endIndex - startIndex - 1)) * chartWidth;
        const y = padding.top + chartHeight * (1 - pwmSignal[i]);

        if (i === startIndex) {
          ctx.moveTo(x, y);
        } else {
          // Draw vertical line first (step response)
          if (Math.abs(y - lastY) > 1) {
            ctx.lineTo(x, lastY);
          }
          ctx.lineTo(x, y);
        }
        lastY = y;
      }
      ctx.stroke();

      // Fill under PWM
      ctx.fillStyle = "#00ff8815";
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);

      lastY = padding.top + chartHeight;
      for (let i = startIndex; i < endIndex; i++) {
        const x = padding.left + ((i - startIndex) / (endIndex - startIndex - 1)) * chartWidth;
        const y = padding.top + chartHeight * (1 - pwmSignal[i]);

        if (Math.abs(y - lastY) > 1) {
          ctx.lineTo(x, lastY);
        }
        ctx.lineTo(x, y);
        lastY = y;
      }

      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Draw average (filtered) signal
    if (showAverage && averageSignal.length > 0) {
      ctx.strokeStyle = "#feca57";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = startIndex; i < endIndex; i++) {
        const x = padding.left + ((i - startIndex) / (endIndex - startIndex - 1)) * chartWidth;
        const y = padding.top + chartHeight * (1 - averageSignal[i]);

        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw axes
    drawAxes(ctx, padding, chartWidth, chartHeight, time[startIndex], time[endIndex - 1] || timeWindow, isCompact);

    // Draw cursor
    if (mousePos) {
      ctx.strokeStyle = "#ffffff60";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, padding.top + chartHeight);
      ctx.stroke();

      // Tooltip
      const tooltipText = `t=${(mousePos.time * 1000).toFixed(2)}ms, D=${(mousePos.duty * 100).toFixed(1)}%`;
      const textWidth = ctx.measureText(tooltipText).width;
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(mousePos.x + 5, padding.top + 5, textWidth + 10, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(tooltipText, mousePos.x + 10, padding.top + 18);
    }

    // Draw legend
    drawLegend(ctx, padding, chartWidth, showModulating, showPWM, showAverage, showCarrier);

  }, [signalData, dimensions, timeWindow, showCarrier, showModulating, showPWM, showAverage, mousePos]);

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

function drawGrid(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  chartHeight: number,
  isCompact: boolean
) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  // Horizontal grid lines
  const ySteps = isCompact ? 2 : 4;
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + (chartHeight / ySteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Vertical grid lines
  const xSteps = isCompact ? 4 : 8;
  for (let i = 0; i <= xSteps; i++) {
    const x = padding.left + (chartWidth / xSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();
  }
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  chartHeight: number,
  startTime: number,
  endTime: number,
  isCompact: boolean
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

  // X axis labels (time)
  ctx.fillStyle = "#888";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";

  const numLabels = isCompact ? 3 : 5;
  for (let i = 0; i <= numLabels; i++) {
    const t = startTime + (endTime - startTime) * (i / numLabels);
    const x = padding.left + (chartWidth / numLabels) * i;
    ctx.fillText(`${(t * 1000).toFixed(1)}ms`, x, padding.top + chartHeight + (isCompact ? 12 : 15));
  }

  // Y axis labels (0-100%)
  ctx.textAlign = "right";
  const yLabels = isCompact ? ["0%", "100%"] : ["0%", "50%", "100%"];
  yLabels.forEach((label, index) => {
    const y = padding.top + chartHeight - (index / (yLabels.length - 1)) * chartHeight;
    ctx.fillText(label, padding.left - 5, y + 3);
  });

  // X axis title
  if (!isCompact) {
    ctx.fillStyle = "#667eea";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time", padding.left + chartWidth / 2, padding.top + chartHeight + 32);
  }
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  padding: { left: number; right: number; top: number; bottom: number },
  chartWidth: number,
  showModulating: boolean,
  showPWM: boolean,
  showAverage: boolean,
  showCarrier: boolean
) {
  const items: { color: string; label: string }[] = [];

  if (showModulating) items.push({ color: "#f093fb", label: "Modulating" });
  if (showPWM) items.push({ color: "#00ff88", label: "PWM" });
  if (showAverage) items.push({ color: "#feca57", label: "Average" });
  if (showCarrier) items.push({ color: "#54a0ff", label: "Duty" });

  ctx.font = "10px sans-serif";
  let x = padding.left + chartWidth - 10;

  items.reverse().forEach(item => {
    const textWidth = ctx.measureText(item.label).width;
    x -= textWidth + 20;

    ctx.fillStyle = item.color;
    ctx.fillRect(x, padding.top + 5, 10, 10);

    ctx.fillStyle = "#888";
    ctx.textAlign = "left";
    ctx.fillText(item.label, x + 14, padding.top + 13);
  });
}
