"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ModulatedSignalData } from "@/lib/signal/modulation";

interface ModulationCanvasProps {
  signalData: ModulatedSignalData;
  timeWindow: number;
  showCarrier: boolean;
  showModulating: boolean;
  showModulated: boolean;
  showEnvelope: boolean;
  showInstantFreq: boolean;
}

export const ModulationCanvas: React.FC<ModulationCanvasProps> = ({
  signalData,
  timeWindow,
  showCarrier,
  showModulating,
  showModulated,
  showEnvelope,
  showInstantFreq,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !signalData) return;

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

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const { time, carrier, modulating, modulated, envelope, instantFrequency } = signalData;

    // Find visible range based on time window
    const totalDuration = time[time.length - 1];
    const startTime = 0;
    const endTime = Math.min(timeWindow, totalDuration);

    const startIdx = 0;
    const endIdx = Math.min(
      Math.floor((endTime / totalDuration) * time.length),
      time.length - 1
    );

    const visibleSamples = endIdx - startIdx;
    if (visibleSamples <= 0) return;

    // Helper to draw signal
    const drawSignal = (
      data: number[],
      color: string,
      alpha: number = 1,
      lineWidth: number = 1.5,
      minVal?: number,
      maxVal?: number
    ) => {
      if (data.length === 0) return;

      // Find min/max for scaling
      let dataMin = minVal ?? Math.min(...data.slice(startIdx, endIdx + 1));
      let dataMax = maxVal ?? Math.max(...data.slice(startIdx, endIdx + 1));

      // Add padding
      const range = dataMax - dataMin || 1;
      dataMin -= range * 0.1;
      dataMax += range * 0.1;

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = alpha;
      ctx.beginPath();

      for (let i = startIdx; i <= endIdx; i++) {
        const x = ((i - startIdx) / visibleSamples) * width;
        const normalized = (data[i] - dataMin) / (dataMax - dataMin);
        const y = height - normalized * height;

        if (i === startIdx) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // Draw signals in order (back to front)

    // Carrier (dimmed, in background)
    if (showCarrier && carrier.length > 0) {
      drawSignal(carrier, "#54a0ff", 0.3, 1);
    }

    // Modulating signal
    if (showModulating && modulating.length > 0) {
      drawSignal(modulating, "#f093fb", 0.7, 1.5);
    }

    // Envelope (for AM)
    if (showEnvelope && envelope && envelope.length > 0) {
      drawSignal(envelope, "#feca57", 0.8, 2);
      // Draw negative envelope
      const negEnvelope = envelope.map(v => -v);
      drawSignal(negEnvelope, "#feca57", 0.8, 2);
    }

    // Modulated signal (main output)
    if (showModulated && modulated.length > 0) {
      drawSignal(modulated, "#00ff88", 1, 1.5);
    }

    // Instantaneous frequency (for FM) - draw on separate scale
    if (showInstantFreq && instantFrequency && instantFrequency.length > 0) {
      // Draw in upper portion of canvas
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height * 0.3);
      ctx.clip();

      const freqMin = Math.min(...instantFrequency.slice(startIdx, endIdx + 1));
      const freqMax = Math.max(...instantFrequency.slice(startIdx, endIdx + 1));
      const freqRange = freqMax - freqMin || 1;

      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();

      for (let i = startIdx; i <= endIdx; i++) {
        const x = ((i - startIdx) / visibleSamples) * width;
        const normalized = (instantFrequency[i] - freqMin) / freqRange;
        const y = height * 0.3 - normalized * height * 0.25;

        if (i === startIdx) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "10px monospace";
      ctx.fillText("Inst. Freq", 5, 12);
    }

    // Time axis labels
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.fillText(`0`, 5, height - 5);
    ctx.fillText(`${(timeWindow * 1000).toFixed(0)}ms`, width - 40, height - 5);

    // Legend
    const legendItems: { color: string; label: string; show: boolean }[] = [
      { color: "#00ff88", label: "Modulated", show: showModulated },
      { color: "#f093fb", label: "Message", show: showModulating },
      { color: "#54a0ff", label: "Carrier", show: showCarrier },
      { color: "#feca57", label: "Envelope", show: showEnvelope },
    ];

    let legendX = width - 10;
    ctx.font = "10px monospace";
    ctx.textAlign = "right";

    legendItems
      .filter(item => item.show)
      .reverse()
      .forEach((item, idx) => {
        const y = 12 + idx * 14;
        ctx.fillStyle = item.color;
        ctx.fillText(item.label, legendX, y);
      });

    ctx.textAlign = "left";
  }, [signalData, timeWindow, showCarrier, showModulating, showModulated, showEnvelope, showInstantFreq]);

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
