import GIF from "gif.js";
import { Radius, Point2D, RadiusPosition } from "@/types/radius";

export interface GifExportOptions {
  /** Duration of the GIF in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Quality (1-30, lower is better) */
  quality?: number;
  /** Width of the output GIF */
  width: number;
  /** Height of the output GIF */
  height: number;
  /** Show grid */
  showGrid: boolean;
  /** Show radii/vectors */
  showRadii: boolean;
  /** Trail length in frames */
  trailLength: number;
  /** Zoom level */
  zoom: number;
  /** Animation speed multiplier */
  animationSpeed: number;
}

export interface GifExportProgress {
  phase: "rendering" | "encoding";
  progress: number; // 0-100
}

/**
 * Calculate radius positions at a given time
 */
function calculatePositions(
  radii: Radius[],
  centerX: number,
  centerY: number,
  time: number
): RadiusPosition[] {
  const positions: RadiusPosition[] = [];
  const sortedRadii = [...radii].sort((a, b) => a.order - b.order);
  const endPointMap = new Map<string | null, Point2D>();
  endPointMap.set(null, { x: centerX, y: centerY });

  for (const radius of sortedRadii) {
    if (!radius.isActive) continue;

    const parentEndPoint = endPointMap.get(radius.parentId);
    const startPoint = parentEndPoint || { x: centerX, y: centerY };

    let currentAngle: number;
    if (radius.rotationSpeed === 0) {
      currentAngle = radius.initialAngle;
    } else {
      const direction = radius.direction === "clockwise" ? -1 : 1;
      const angularVelocity = direction * radius.rotationSpeed * 2 * Math.PI;
      currentAngle = radius.initialAngle + angularVelocity * time;
    }

    const endPoint: Point2D = {
      x: startPoint.x + radius.length * Math.cos(currentAngle),
      y: startPoint.y + radius.length * Math.sin(currentAngle),
    };

    positions.push({
      radiusId: radius.id,
      startPoint,
      endPoint,
      angle: currentAngle,
      length: radius.length,
    });

    endPointMap.set(radius.id, endPoint);
  }

  return positions;
}

/**
 * Draw a single frame to canvas
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radii: Radius[],
  trackedRadiusIds: string[],
  trails: Map<string, Point2D[]>,
  time: number,
  options: GifExportOptions
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Clear
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  // Grid
  if (options.showGrid) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = centerX % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = centerY % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
  }

  // Apply zoom
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(options.zoom, options.zoom);
  ctx.translate(-centerX, -centerY);

  // Calculate positions
  const positions = calculatePositions(radii, centerX, centerY, time);

  // Update and draw trails
  for (const radiusId of trackedRadiusIds) {
    const pos = positions.find((p) => p.radiusId === radiusId);
    if (pos) {
      if (!trails.has(radiusId)) {
        trails.set(radiusId, []);
      }
      const trail = trails.get(radiusId)!;
      trail.push({ ...pos.endPoint });
      if (trail.length > options.trailLength) {
        trail.shift();
      }
    }
  }

  // Draw trails
  for (const [radiusId, trail] of trails.entries()) {
    if (trail.length < 2) continue;
    const radius = radii.find((r) => r.id === radiusId);
    const color = radius?.color || "#667eea";

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  }

  // Draw radii
  if (options.showRadii) {
    const radiusMap = new Map(radii.map((r) => [r.id, r]));

    for (const position of positions) {
      const radius = radiusMap.get(position.radiusId);
      if (!radius) continue;

      const { startPoint, endPoint } = position;

      // Line
      ctx.strokeStyle = radius.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();

      // Start point
      ctx.fillStyle = radius.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;

      // End point
      ctx.fillStyle = radius.color;
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // White border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  // Center point
  ctx.fillStyle = "#4CAF50";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore();
}

/**
 * Fast GIF export using direct mathematical rendering
 * No need to record the canvas - renders frames directly from radius parameters
 */
export async function exportCanvasGIF(
  radii: Radius[],
  trackedRadiusIds: string[],
  options: GifExportOptions,
  onProgress?: (progress: GifExportProgress) => void
): Promise<Blob> {
  const { duration, fps, quality = 10, width, height } = options;

  const totalFrames = Math.ceil(duration * fps);
  const frameDelay = 1000 / fps;
  const timeStep = (1 / fps) * options.animationSpeed;

  // Create offscreen canvas for rendering
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Create GIF encoder
  const gif = new GIF({
    workers: 4,
    quality,
    width,
    height,
    workerScript: "/gif.worker.js",
  });

  // Trail storage
  const trails = new Map<string, Point2D[]>();

  // Render all frames synchronously (fast!)
  for (let i = 0; i < totalFrames; i++) {
    const time = i * timeStep;

    drawFrame(ctx, width, height, radii, trackedRadiusIds, trails, time, options);

    gif.addFrame(ctx, { delay: frameDelay, copy: true });

    // Report progress every 10 frames
    if (i % 10 === 0 || i === totalFrames - 1) {
      onProgress?.({
        phase: "rendering",
        progress: Math.round(((i + 1) / totalFrames) * 50),
      });
      // Yield to UI to show progress
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Encode GIF
  return new Promise((resolve, reject) => {
    gif.on("progress", (p: number) => {
      onProgress?.({
        phase: "encoding",
        progress: 50 + Math.round(p * 50),
      });
    });

    gif.on("finished", (blob: Blob) => {
      resolve(blob);
    });

    gif.on("abort", () => {
      reject(new Error("GIF encoding was aborted"));
    });

    try {
      gif.render();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Downloads a blob as a file
 */
export function downloadGIF(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `harmonic-wave-${Date.now()}.gif`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
