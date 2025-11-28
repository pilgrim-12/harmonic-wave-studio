import { useEffect, useRef, useState } from "react";

interface ComputeLoadOptions {
  sampleSize?: number; // Number of frames to average over
  targetFps?: number; // Target FPS (default 60)
  updateInterval?: number; // How often to update the load value (ms)
}

/**
 * Hook to measure real computational load based on frame timing
 * Returns a percentage (0-100) representing how much time is spent computing vs available time
 */
export function useComputeLoad(
  isActive: boolean,
  options: ComputeLoadOptions = {}
): number {
  const {
    sampleSize = 60,
    targetFps = 60,
    updateInterval = 500,
  } = options;

  const [computeLoad, setComputeLoad] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setComputeLoad(0);
      frameTimesRef.current = [];
      lastFrameTimeRef.current = 0;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const targetFrameTime = 1000 / targetFps; // 16.67ms for 60fps

    const measureFrame = () => {
      const now = performance.now();

      if (lastFrameTimeRef.current > 0) {
        const frameTime = now - lastFrameTimeRef.current;
        frameTimesRef.current.push(frameTime);

        // Keep only the last N samples
        if (frameTimesRef.current.length > sampleSize) {
          frameTimesRef.current.shift();
        }
      }

      lastFrameTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(measureFrame);
    };

    // Start measuring
    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(measureFrame);

    // Update load value periodically
    const updateInterval_id = setInterval(() => {
      if (frameTimesRef.current.length < 10) {
        return; // Not enough samples yet
      }

      // Calculate average frame time
      const avgFrameTime =
        frameTimesRef.current.reduce((sum, time) => sum + time, 0) /
        frameTimesRef.current.length;

      // Convert to load percentage
      // targetFrameTime (16.67ms) = 0% load
      // 2 * targetFrameTime (33.33ms) = 100% load
      // Anything beyond that is capped at 100%
      const rawLoad = Math.max(
        0,
        ((avgFrameTime - targetFrameTime) / targetFrameTime) * 100
      );
      const cappedLoad = Math.min(100, rawLoad);

      setComputeLoad(Math.round(cappedLoad));
    }, updateInterval);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(updateInterval_id);
    };
  }, [isActive, sampleSize, targetFps, updateInterval]);

  return computeLoad;
}

/**
 * Alternative approach using requestIdleCallback to measure browser idle time
 * Returns percentage (0-100) where higher = less idle time = more load
 */
export function useIdleLoad(
  isActive: boolean,
  options: { updateInterval?: number } = {}
): number {
  const { updateInterval = 500 } = options;
  const [idleLoad, setIdleLoad] = useState(0);
  const idleTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setIdleLoad(0);
      idleTimesRef.current = [];
      return;
    }

    // Check if requestIdleCallback is available
    if (typeof requestIdleCallback === "undefined") {
      return;
    }

    let isRunning = true;

    const measureIdle = () => {
      if (!isRunning) return;

      requestIdleCallback(
        (deadline) => {
          const timeRemaining = deadline.timeRemaining();
          idleTimesRef.current.push(timeRemaining);

          // Keep last 20 samples
          if (idleTimesRef.current.length > 20) {
            idleTimesRef.current.shift();
          }

          measureIdle();
        },
        { timeout: 1000 }
      );
    };

    measureIdle();

    const updateInterval_id = setInterval(() => {
      if (idleTimesRef.current.length < 5) {
        return;
      }

      // Calculate average idle time
      const avgIdleTime =
        idleTimesRef.current.reduce((sum, time) => sum + time, 0) /
        idleTimesRef.current.length;

      // Convert to load percentage
      // 50ms idle = 0% load (very idle)
      // 0ms idle = 100% load (no idle time)
      const rawLoad = Math.max(0, 100 - (avgIdleTime / 50) * 100);
      const cappedLoad = Math.min(100, rawLoad);

      setIdleLoad(Math.round(cappedLoad));
    }, updateInterval);

    return () => {
      isRunning = false;
      clearInterval(updateInterval_id);
    };
  }, [isActive, updateInterval]);

  return idleLoad;
}
