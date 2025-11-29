import GIF from "gif.js";

export interface GifExportOptions {
  /** Duration of the GIF in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Quality (1-30, lower is better) */
  quality?: number;
  /** Width of the output GIF (null = original canvas size) */
  width?: number | null;
  /** Height of the output GIF (null = original canvas size) */
  height?: number | null;
}

export interface GifExportProgress {
  phase: "capturing" | "rendering";
  progress: number; // 0-100
}

/**
 * Captures animation frames from a canvas and exports as GIF
 *
 * @param getCanvas Function that returns the canvas element
 * @param playSimulation Function to start/reset the simulation
 * @param stopSimulation Function to stop the simulation
 * @param options GIF export options
 * @param onProgress Progress callback
 * @returns Promise that resolves to the GIF blob
 */
export async function exportCanvasGIF(
  getCanvas: () => HTMLCanvasElement | null,
  playSimulation: () => void,
  stopSimulation: () => void,
  resetSimulation: () => void,
  options: GifExportOptions,
  onProgress?: (progress: GifExportProgress) => void
): Promise<Blob> {
  const { duration, fps, quality = 10, width = null, height = null } = options;

  const canvas = getCanvas();
  if (!canvas) {
    throw new Error("Canvas not found");
  }

  const totalFrames = Math.ceil(duration * fps);
  const frameDelay = 1000 / fps;

  // Determine output dimensions
  const outputWidth = width || canvas.width;
  const outputHeight = height || canvas.height;

  // Create GIF encoder
  const gif = new GIF({
    workers: 2,
    quality,
    width: outputWidth,
    height: outputHeight,
    workerScript: "/gif.worker.js",
  });

  // Create a temporary canvas for resizing if needed
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = outputWidth;
  tempCanvas.height = outputHeight;
  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) {
    throw new Error("Could not get 2D context");
  }

  // Reset and start simulation
  resetSimulation();

  // Wait a bit for reset to take effect
  await new Promise(resolve => setTimeout(resolve, 100));

  playSimulation();

  // Capture frames
  const frames: ImageData[] = [];

  for (let i = 0; i < totalFrames; i++) {
    // Wait for next frame timing
    await new Promise(resolve => setTimeout(resolve, frameDelay));

    const currentCanvas = getCanvas();
    if (!currentCanvas) {
      throw new Error("Canvas lost during capture");
    }

    // Draw to temp canvas (handles resizing)
    tempCtx.fillStyle = "#000000";
    tempCtx.fillRect(0, 0, outputWidth, outputHeight);
    tempCtx.drawImage(currentCanvas, 0, 0, outputWidth, outputHeight);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, outputWidth, outputHeight);
    frames.push(imageData);

    // Report progress
    onProgress?.({
      phase: "capturing",
      progress: Math.round(((i + 1) / totalFrames) * 100),
    });
  }

  // Stop simulation after capturing
  stopSimulation();

  // Add frames to GIF
  for (const frame of frames) {
    // Create a temporary canvas for this frame
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = outputWidth;
    frameCanvas.height = outputHeight;
    const frameCtx = frameCanvas.getContext("2d");
    if (frameCtx) {
      frameCtx.putImageData(frame, 0, 0);
      gif.addFrame(frameCanvas, { delay: frameDelay, copy: true });
    }
  }

  // Render GIF
  return new Promise((resolve, reject) => {
    gif.on("progress", (p: number) => {
      onProgress?.({
        phase: "rendering",
        progress: Math.round(p * 100),
      });
    });

    gif.on("finished", (blob: Blob) => {
      resolve(blob);
    });

    gif.on("abort", () => {
      reject(new Error("GIF rendering was aborted"));
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

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
