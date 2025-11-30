"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { calculateSweepFrequency, calculateEnvelopeValue } from "@/lib/canvas/calculator";

interface FrequencySlice {
  time: number;
  frequencies: { freq: number; amplitude: number; color: string }[];
}

export const SpectrogramView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const slicesRef = useRef<FrequencySlice[]>([]);
  const frameCountRef = useRef<number>(0);

  const radii = useRadiusStore((state) => state.radii);
  const { currentTime, isPlaying } = useSimulationStore();

  // Max frequency to display (based on radii frequencies)
  const maxFreq = useMemo(() => {
    if (radii.length === 0) return 10;
    const freqs = radii.map((r) => {
      if (r.sweep?.enabled) {
        return Math.max(r.sweep.startFreq, r.sweep.endFreq);
      }
      return r.rotationSpeed;
    });
    return Math.max(...freqs, 1) * 1.2;
  }, [radii]);

  // Add new slice on each animation frame when playing
  useEffect(() => {
    if (!isPlaying) return;

    const addSlice = () => {
      // Get LIVE currentTime from store, not from closure
      const { currentTime: liveTime } = useSimulationStore.getState();
      const { radii: liveRadii } = useRadiusStore.getState();

      const frequencies = liveRadii
        .filter((r) => r.isActive)
        .map((r) => {
          // Calculate effective frequency (with sweep)
          let freq = r.rotationSpeed;
          if (r.sweep?.enabled) {
            freq = calculateSweepFrequency(r.sweep, r.rotationSpeed, liveTime);
          }

          // Calculate effective amplitude (with envelope)
          let amplitude = r.length;
          if (r.envelope?.enabled) {
            const envValue = calculateEnvelopeValue(r.envelope, liveTime);
            amplitude = r.length * envValue;
          }

          return { freq, amplitude, color: r.color };
        });

      slicesRef.current.push({ time: liveTime, frequencies });

      // Keep only last 5 seconds
      const cutoffTime = liveTime - 5;
      while (slicesRef.current.length > 0 && slicesRef.current[0].time < cutoffTime) {
        slicesRef.current.shift();
      }
    };

    const interval = setInterval(addSlice, 50); // 20 slices per second
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      frameCountRef.current++;
      if (frameCountRef.current % 2 === 0) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;

        // Clear
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);

        // Padding
        const padding = { left: 50, right: 20, top: 15, bottom: 30 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        const { currentTime: time } = useSimulationStore.getState();
        const graphDuration = 5; // 5 seconds

        // Draw grid and axes
        drawGridAndAxes(ctx, width, height, padding, time, graphDuration, maxFreq);

        // Draw spectrogram
        drawSpectrogram(
          ctx,
          slicesRef.current,
          padding,
          graphWidth,
          graphHeight,
          time,
          graphDuration,
          maxFreq
        );

        // Draw current frequency markers
        drawCurrentFrequencies(ctx, radii, time, padding, graphWidth, graphHeight, maxFreq);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [radii, maxFreq]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={16} className="text-[#f093fb]" />
        <h3 className="text-sm font-bold text-[#f093fb]">Spectrogram</h3>
      </div>
      <div className="flex-1 min-h-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

function drawGridAndAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: { left: number; right: number; top: number; bottom: number },
  currentTime: number,
  graphDuration: number,
  maxFreq: number
) {
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Helper functions
  const timeToX = (t: number) => {
    const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
    return padding.left + normalizedTime * graphWidth;
  };

  const freqToY = (f: number) => {
    return padding.top + graphHeight - (f / maxFreq) * graphHeight;
  };

  // Draw grid
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  // Horizontal grid lines (frequency)
  const freqStep = maxFreq / 5;
  for (let i = 0; i <= 5; i++) {
    const y = freqToY(i * freqStep);
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

  // X axis (bottom)
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Y axis (left)
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Y axis labels (frequency)
  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 5; i++) {
    const freq = i * freqStep;
    const y = freqToY(freq);
    ctx.fillText(freq.toFixed(1), padding.left - 5, y);
  }

  // Time labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i <= 5; i++) {
    const t = currentTime - graphDuration + i * timeStep;
    const x = timeToX(t);
    ctx.fillText(t.toFixed(1) + "s", x, height - padding.bottom + 5);
  }

  // Axis titles
  ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Time (s)", width / 2, height - 5);

  ctx.save();
  ctx.translate(12, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Frequency (Hz)", 0, 0);
  ctx.restore();
}

function drawSpectrogram(
  ctx: CanvasRenderingContext2D,
  slices: FrequencySlice[],
  padding: { left: number; right: number; top: number; bottom: number },
  graphWidth: number,
  graphHeight: number,
  currentTime: number,
  graphDuration: number,
  maxFreq: number
) {
  const timeToX = (t: number) => {
    const normalizedTime = (t - (currentTime - graphDuration)) / graphDuration;
    return padding.left + normalizedTime * graphWidth;
  };

  const freqToY = (f: number) => {
    return padding.top + graphHeight - (f / maxFreq) * graphHeight;
  };

  // Draw each frequency trace as a line
  if (slices.length < 2) return;

  // Group by color/radius
  const traces = new Map<string, { time: number; freq: number; amplitude: number }[]>();

  for (const slice of slices) {
    for (const freqData of slice.frequencies) {
      const key = freqData.color;
      if (!traces.has(key)) {
        traces.set(key, []);
      }
      traces.get(key)!.push({
        time: slice.time,
        freq: freqData.freq,
        amplitude: freqData.amplitude,
      });
    }
  }

  // Draw each trace
  for (const [color, points] of traces) {
    if (points.length < 2) continue;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();

    let firstPoint = true;
    for (const point of points) {
      const x = timeToX(point.time);
      if (x < padding.left) continue;

      const y = freqToY(point.freq);

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function drawCurrentFrequencies(
  ctx: CanvasRenderingContext2D,
  radii: { rotationSpeed: number; color: string; isActive: boolean; sweep?: { enabled: boolean; startFreq: number; endFreq: number; duration: number; loop: boolean }; envelope?: { enabled: boolean; attack: number; decay: number; sustain: number; release: number; curve: string; loop: boolean } }[],
  currentTime: number,
  padding: { left: number; right: number; top: number; bottom: number },
  graphWidth: number,
  graphHeight: number,
  maxFreq: number
) {
  const freqToY = (f: number) => {
    return padding.top + graphHeight - (f / maxFreq) * graphHeight;
  };

  const rightEdge = padding.left + graphWidth;

  for (const r of radii) {
    if (!r.isActive) continue;

    let freq = r.rotationSpeed;
    if (r.sweep?.enabled) {
      freq = calculateSweepFrequency(r.sweep as any, r.rotationSpeed, currentTime);
    }

    const y = freqToY(freq);

    // Draw current position dot
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.arc(rightEdge, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw frequency label
    ctx.fillStyle = r.color;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(freq.toFixed(1) + " Hz", rightEdge + 8, y);
  }
}
