"use client";

import React, { useRef, useEffect } from "react";
import { Radius } from "@/services/projectService";
import {
  calculateEnvelopeValue,
  calculateSweepFrequency,
  calculateLFOValue,
  calculateTimelineValues,
} from "@/lib/canvas/calculator";

interface TrajectoryPreviewProps {
  radii: Radius[];
  width?: number;
  height?: number;
  trailLength?: number;
}

/**
 * Renders a small preview of the trajectory/trail for gallery cards
 * Supports modulation effects (LFO, Envelope, Sweep, Timeline)
 */
export const TrajectoryPreview: React.FC<TrajectoryPreviewProps> = ({
  radii,
  width = 200,
  height = 200,
  trailLength = 500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || radii.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate scale to fit trajectory in canvas
    // Account for potential amplitude modulation (LFO can increase amplitude)
    const maxAmplitude = radii.reduce((sum, r) => {
      let amp = r.amplitude;
      // If LFO targets amplitude with depth, max amplitude can be higher
      if (r.lfo?.enabled && r.lfo.target === "amplitude") {
        amp = amp * (1 + r.lfo.depth);
      }
      return sum + amp;
    }, 0);
    const scale = Math.min(width, height) / (maxAmplitude * 2.5);

    // Generate trail points
    const trailPoints: { x: number; y: number }[] = [];
    const steps = Math.min(trailLength, 1000); // Limit for performance
    const timeStep = 0.02; // Time increment per step

    for (let i = 0; i < steps; i++) {
      const t = i * timeStep;
      let x = centerX;
      let y = centerY;

      // Calculate position at time t with modulation
      for (const radius of radii) {
        // Get base values
        let effectiveAmplitude = radius.amplitude;
        let effectiveFrequency = radius.frequency;
        let effectivePhase = radius.phase;

        // Apply Envelope (affects amplitude)
        if (radius.envelope?.enabled) {
          const envValue = calculateEnvelopeValue(radius.envelope, t);
          effectiveAmplitude *= envValue;
        }

        // Apply Sweep (affects frequency over time)
        if (radius.sweep?.enabled) {
          effectiveFrequency = calculateSweepFrequency(
            radius.sweep,
            Math.abs(radius.frequency),
            t
          );
          // Preserve direction sign
          if (radius.frequency < 0) effectiveFrequency = -effectiveFrequency;
        }

        // Apply LFO
        if (radius.lfo?.enabled) {
          const lfoValue = calculateLFOValue(radius.lfo, t);

          switch (radius.lfo.target) {
            case "amplitude":
              effectiveAmplitude *= (1 + lfoValue);
              break;
            case "frequency":
              effectiveFrequency *= (1 + lfoValue);
              break;
            case "phase":
              effectivePhase += lfoValue * Math.PI;
              break;
          }
        }

        // Apply Timeline keyframes
        if (radius.timeline?.enabled) {
          const timelineValues = calculateTimelineValues(radius.timeline, t);
          if (timelineValues.amplitude !== null) {
            effectiveAmplitude = timelineValues.amplitude;
          }
          if (timelineValues.frequency !== null) {
            effectiveFrequency = timelineValues.frequency;
          }
          if (timelineValues.phase !== null) {
            effectivePhase += (timelineValues.phase * Math.PI) / 180;
          }
        }

        // Calculate angle for this radius at time t
        const angle = effectivePhase + effectiveFrequency * t * 2 * Math.PI;

        // Update position - each radius extends from current position
        x += effectiveAmplitude * Math.cos(angle) * scale;
        y += effectiveAmplitude * Math.sin(angle) * scale;
      }

      trailPoints.push({ x, y });
    }

    // Draw trail with gradient (newer points brighter)
    if (trailPoints.length > 1) {
      for (let i = 1; i < trailPoints.length; i++) {
        const progress = i / trailPoints.length;
        const alpha = progress * 0.8; // Fade in effect

        ctx.strokeStyle = `rgba(102, 126, 234, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(trailPoints[i - 1].x, trailPoints[i - 1].y);
        ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
        ctx.stroke();
      }
    }

    // Draw center point
    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
  }, [radii, width, height, trailLength]);

  if (radii.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20"
        style={{ width, height }}
      >
        <span className="text-xs text-gray-500">No radii</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "crisp-edges",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain"
        }}
      />
    </div>
  );
};
