import { create } from "zustand";
import {
  NoiseConfig,
  FilterConfig,
  SignalProcessingState,
} from "@/types/signal";
import { addNoiseWithSNR } from "@/lib/signal/noiseGenerator";
import { calculateQualityMetrics } from "@/lib/signal/qualityMetrics";

interface SignalProcessingStore extends SignalProcessingState {
  // ✅ NEW: Flag to track if noise was applied
  noiseApplied: boolean;

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

export const useSignalProcessingStore = create<SignalProcessingStore>(
  (set, get) => ({
    ...initialState,
    noiseApplied: false, // ✅ Initial state

    setOriginalSignal: (signal) => {
      // ✅ Check if noise was previously applied
      const { noiseApplied, noiseConfig } = get();

      if (noiseApplied && noiseConfig) {
        // ✅ Re-apply noise to new signal automatically
        const newNoisy = addNoiseWithSNR(
          signal,
          noiseConfig.type,
          noiseConfig.snr,
          noiseConfig.frequency,
          100
        );

        set({
          original: signal,
          noisy: newNoisy, // ✅ Keep noise applied
          filtered: [],
          noiseApplied: true, // ✅ Keep flag
        });

        // Update metrics
        get().updateMetrics();
      } else {
        // No noise was applied - just update original
        set({
          original: signal,
          noisy: [],
          filtered: [],
          noiseApplied: false, // ✅ Reset flag
        });
      }
    },

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
        noiseApplied: true, // ✅ Set flag to true
      });

      get().updateMetrics();
    },

    updateNoiseConfig: (config) => {
      const current = get().noiseConfig;
      if (!current) return;

      const updated = { ...current, ...config };

      // ✅ Apply noise immediately if it was already applied
      const { original, noiseApplied } = get();
      if (original.length > 0 && noiseApplied) {
        const noisy = addNoiseWithSNR(
          original,
          updated.type,
          updated.snr,
          updated.frequency,
          100
        );

        // ✅ Batch update - noiseConfig + noisy together
        set({
          noiseConfig: updated,
          noisy: noisy,
          noiseApplied: true, // ✅ Keep flag
        });

        // Update metrics after state is set
        get().updateMetrics();
      } else {
        // No noise applied yet - just update config
        set({ noiseConfig: updated });
      }
    },

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

      // Re-apply filter if we have noisy signal
      const { noisy } = get();
      if (noisy.length > 0) {
        get().applyFilter(noisy, updated);
      }
    },

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

    resetSignal: () => {
      set({
        ...initialState,
        noiseApplied: false, // ✅ Reset flag
      });
    },
  })
);
