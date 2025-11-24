import { create } from "zustand";
import {
  NoiseConfig,
  FilterConfig,
  SignalProcessingState,
} from "@/types/signal";
import { addNoiseWithSNR } from "@/lib/signal/noiseGenerator";
import { calculateQualityMetrics } from "@/lib/signal/qualityMetrics";

// ============================================================================
// TYPES
// ============================================================================

export interface SignalPoint {
  time: number;
  y: number;
}

// ✅ Shared scale for all graphs
export interface SignalScale {
  minY: number;
  maxY: number;
  avgY: number;
}

interface SignalProcessingStore extends SignalProcessingState {
  // ✅ NEW: Signal buffer (single source of truth)
  signalBuffer: SignalPoint[];
  bufferMaxDuration: number; // Max time duration to keep in buffer (seconds)

  // ✅ NEW: Shared scale for all graphs
  scale: SignalScale;

  // ✅ Flag to track if noise was applied
  noiseApplied: boolean;

  // ✅ NEW: Buffer operations (single source of truth)
  pushSignalPoint: (time: number, y: number) => void;
  clearBuffer: () => void;
  setBufferDuration: (duration: number) => void;
  getSignalYValues: () => number[];

  // Noise operations
  applyNoise: (
    signal: number[],
    config: NoiseConfig,
    sampleRate?: number
  ) => void;
  updateNoiseConfig: (config: Partial<NoiseConfig>) => void;

  // Filter operations
  applyFilter: (signal: number[], config: FilterConfig) => void;
  updateFilterConfig: (config: Partial<FilterConfig>) => void;

  // Signal operations
  setOriginalSignal: (signal: number[]) => void;
  resetSignal: () => void;

  // Metrics
  updateMetrics: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: SignalProcessingState = {
  original: [],
  noisy: [],
  filtered: [],
  noiseConfig: {
    type: "white",
    snr: 20,
    amplitude: 0.3,
  },
  filterConfig: {
    type: "lowpass",
    cutoffFreq: 10,
    order: 4,
  },
  metrics: {
    originalVsNoisy: {
      snr: 0,
      mse: 0,
      psnr: 0,
      correlation: 1,
      rmse: 0,
    },
    originalVsFiltered: {
      snr: 0,
      mse: 0,
      psnr: 0,
      correlation: 1,
      rmse: 0,
    },
    improvement: 0,
  },
};

// ============================================================================
// STORE
// ============================================================================

export const useSignalProcessingStore = create<SignalProcessingStore>(
  (set, get) => ({
    ...initialState,

    // ✅ NEW: Signal buffer state
    signalBuffer: [],
    bufferMaxDuration: 5, // Default 5 seconds
    noiseApplied: false,

    // ✅ NEW: Shared scale for all graphs
    scale: { minY: -50, maxY: 50, avgY: 0 },

    // =========================================================================
    // ✅ NEW: BUFFER OPERATIONS (Single Source of Truth)
    // =========================================================================

    /**
     * Push a new signal point to the buffer
     * This is the ONLY place where signal data enters the system
     * Called from page.tsx animation loop
     *
     * ✅ OPTIMIZED: Mutate arrays in place, single setState call
     */
    pushSignalPoint: (time: number, y: number) => {
      const state = get();
      const {
        signalBuffer,
        bufferMaxDuration,
        noiseApplied,
        noiseConfig,
        scale,
      } = state;

      // ✅ Mutate buffer in place (avoid spread operator)
      signalBuffer.push({ time, y });

      // Remove old points (keep only bufferMaxDuration seconds)
      const cutoffTime = time - bufferMaxDuration;
      while (signalBuffer.length > 0 && signalBuffer[0].time < cutoffTime) {
        signalBuffer.shift();
      }

      // ✅ Extract Y values efficiently
      const originalY = new Array(signalBuffer.length);
      for (let i = 0; i < signalBuffer.length; i++) {
        originalY[i] = signalBuffer[i].y;
      }

      // ✅ Auto-apply noise if it was previously enabled
      let noisyY: number[] = [];
      if (noiseApplied && noiseConfig && originalY.length > 0) {
        noisyY = addNoiseWithSNR(
          originalY,
          noiseConfig.type,
          noiseConfig.snr,
          noiseConfig.frequency,
          100
        );
      }

      // ✅ Calculate shared scale for all graphs
      let newScale = scale;
      if (originalY.length > 10) {
        // Calculate average (DC offset)
        let sumY = 0;
        for (let i = 0; i < originalY.length; i++) {
          sumY += originalY[i];
        }
        const avgY = sumY / originalY.length;

        // Find min/max (sample for performance)
        let minY = Infinity;
        let maxY = -Infinity;
        const step = Math.max(1, Math.floor(originalY.length / 50));

        for (let i = 0; i < originalY.length; i += step) {
          const centered = originalY[i] - avgY;
          minY = Math.min(minY, centered);
          maxY = Math.max(maxY, centered);
        }

        // Include noisy in scale calculation
        if (noisyY.length > 0) {
          for (let i = 0; i < noisyY.length; i += step) {
            const centered = noisyY[i] - avgY;
            minY = Math.min(minY, centered);
            maxY = Math.max(maxY, centered);
          }
        }

        // Symmetric range around 0
        const absMax = Math.max(Math.abs(minY), Math.abs(maxY), 10);
        minY = -absMax * 1.1; // 10% padding
        maxY = absMax * 1.1;

        // Smooth scale transitions
        const smoothing = 0.1;
        newScale = {
          minY: scale.minY * (1 - smoothing) + minY * smoothing,
          maxY: scale.maxY * (1 - smoothing) + maxY * smoothing,
          avgY: scale.avgY * (1 - smoothing) + avgY * smoothing,
        };
      }

      // ✅ Single setState call
      set({
        signalBuffer,
        original: originalY,
        noisy: noisyY,
        scale: newScale,
      });
    },

    /**
     * Clear the signal buffer
     */
    clearBuffer: () => {
      set({
        signalBuffer: [],
        original: [],
        noisy: [],
        filtered: [],
      });
    },

    /**
     * Set the maximum duration of data to keep in buffer
     */
    setBufferDuration: (duration: number) => {
      set({ bufferMaxDuration: Math.max(1, Math.min(duration, 30)) });
    },

    /**
     * Get Y values from buffer (for compatibility)
     */
    getSignalYValues: () => {
      return get().signalBuffer.map((p) => p.y);
    },

    // =========================================================================
    // ORIGINAL SIGNAL OPERATIONS
    // =========================================================================

    /**
     * Set original signal directly (for bulk updates)
     * Used when loading projects or for batch processing
     */
    setOriginalSignal: (signal) => {
      const { noiseApplied, noiseConfig } = get();

      if (noiseApplied && noiseConfig) {
        // Re-apply noise to new signal automatically
        const newNoisy = addNoiseWithSNR(
          signal,
          noiseConfig.type,
          noiseConfig.snr,
          noiseConfig.frequency,
          100
        );

        set({
          original: signal,
          noisy: newNoisy,
          filtered: [],
          noiseApplied: true,
        });

        get().updateMetrics();
      } else {
        set({
          original: signal,
          noisy: [],
          filtered: [],
          noiseApplied: false,
        });
      }
    },

    // =========================================================================
    // NOISE OPERATIONS
    // =========================================================================

    applyNoise: (signal, config, sampleRate = 100) => {
      const noisy = addNoiseWithSNR(
        signal,
        config.type,
        config.snr,
        config.frequency,
        sampleRate
      );

      set({
        noisy,
        noiseConfig: config,
        noiseApplied: true,
      });

      get().updateMetrics();
    },

    updateNoiseConfig: (config) => {
      const current = get().noiseConfig;
      if (!current) return;

      const updated = { ...current, ...config };
      const { original, noiseApplied } = get();

      if (original.length > 0 && noiseApplied) {
        const noisy = addNoiseWithSNR(
          original,
          updated.type,
          updated.snr,
          updated.frequency,
          100
        );

        set({
          noiseConfig: updated,
          noisy: noisy,
          noiseApplied: true,
        });

        get().updateMetrics();
      } else {
        set({ noiseConfig: updated });
      }
    },

    // =========================================================================
    // FILTER OPERATIONS
    // =========================================================================

    applyFilter: (signal, config) => {
      // TODO: Implement actual filtering
      // For now, just copy the signal
      set({
        filtered: [...signal],
        filterConfig: config,
      });

      get().updateMetrics();
    },

    updateFilterConfig: (config) => {
      const current = get().filterConfig;
      if (!current) return;

      const updated = { ...current, ...config };
      set({ filterConfig: updated });

      const { noisy } = get();
      if (noisy.length > 0) {
        get().applyFilter(noisy, updated);
      }
    },

    // =========================================================================
    // METRICS
    // =========================================================================

    updateMetrics: () => {
      const { original, noisy, filtered } = get();

      if (original.length === 0) return;

      const originalVsNoisy =
        noisy.length > 0
          ? calculateQualityMetrics(original, noisy)
          : initialState.metrics.originalVsNoisy;

      const originalVsFiltered =
        filtered.length > 0
          ? calculateQualityMetrics(original, filtered)
          : initialState.metrics.originalVsFiltered;

      const improvement = originalVsFiltered.snr - originalVsNoisy.snr;

      set({
        metrics: {
          originalVsNoisy,
          originalVsFiltered,
          improvement,
        },
      });
    },

    // =========================================================================
    // RESET
    // =========================================================================

    resetSignal: () => {
      set({
        ...initialState,
        signalBuffer: [],
        bufferMaxDuration: 5,
        noiseApplied: false,
        scale: { minY: -50, maxY: 50, avgY: 0 },
      });
    },
  })
);
