"use client";

import React, { useRef, useEffect } from "react";
import { Radius } from "@/services/projectService";

interface TrajectoryPreviewProps {
  radii: Radius[];
  width?: number;
  height?: number;
  trailLength?: number;
}

/**
 * Renders a small preview of the trajectory/trail for gallery cards
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
    // Note: Using amplitude as length (radius size)
    const maxRadius = radii.reduce((sum, r) => sum + r.amplitude, 0);
    const scale = Math.min(width, height) / (maxRadius * 2.5);

    // Generate trail points
    const trailPoints: { x: number; y: number }[] = [];
    const steps = Math.min(trailLength, 1000); // Limit for performance
    const timeStep = 0.02; // Time increment per step

    for (let i = 0; i < steps; i++) {
      const t = i * timeStep;
      let x = centerX;
      let y = centerY;

      // Calculate position at time t
      // Note: frequency = rotationSpeed (in Hz), phase = initialAngle, amplitude = length
      // Each radius rotates independently from its starting point
      for (const radius of radii) {
        // Calculate angle for this radius at time t
        const angle = radius.phase + radius.frequency * t * 2 * Math.PI;

        // Update position - each radius extends from current position
        x += radius.amplitude * Math.cos(angle) * scale;
        y += radius.amplitude * Math.sin(angle) * scale;
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
