/**
 * Filter Store
 * Manages digital filter state and operations
 */

import { create } from "zustand";
import {
  designButterworthFilter,
  designChebyshev1Filter,
  designChebyshev2Filter,
  createBandPassFilter,
  createBandStopFilter,
  applyFilter,
  FilterCoefficients,
} from "@/lib/signal/digitalFilters";

export interface FilterSettings {
  type: "butterworth" | "chebyshev1" | "chebyshev2";
  mode: "lowpass" | "highpass" | "bandpass" | "bandstop";
  order: number;
  cutoffFreq: number; // In Hz (for lowpass/highpass) or center frequency (for bandpass/bandstop)
  bandwidth?: number; // In Hz (only for bandpass/bandstop)
  enabled: boolean;
}

interface FilterState {
  // State
  filterSettings: FilterSettings | null;
  filteredSignal: number[];
  isFilterApplied: boolean;
  filterCoefficients: FilterCoefficients | null;

  // Actions
  applyFilterToSignal: (
    signal: number[],
    settings: FilterSettings,
    sampleRate: number
  ) => void;
  clearFilter: () => void;
  setFilterSettings: (settings: FilterSettings) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Initial state
  filterSettings: null,
  filteredSignal: [],
  isFilterApplied: false,
  filterCoefficients: null,

  // Apply filter to signal
  applyFilterToSignal: (
    signal: number[],
    settings: FilterSettings,
    sampleRate: number
  ) => {
    if (signal.length === 0) {
      console.warn("Cannot apply filter to empty signal");
      return;
    }

    try {
      // Normalize cutoff frequency (Hz to 0-0.5 range)
      const normalizedCutoff = settings.cutoffFreq / sampleRate;

      // Validate Nyquist limit
      if (normalizedCutoff >= 0.5) {
        console.warn(
          "Cutoff frequency exceeds Nyquist limit, clamping to 0.49"
        );
      }

      const clampedCutoff = Math.min(0.49, Math.max(0.01, normalizedCutoff));

      // Design filter coefficients based on type and mode
      let coefficients: FilterCoefficients;

      // Handle band-pass and band-stop modes
      if (settings.mode === "bandpass" || settings.mode === "bandstop") {
        const bandwidth = settings.bandwidth || settings.cutoffFreq * 0.2; // Default 20% bandwidth
        const centerFreq = settings.cutoffFreq / sampleRate;
        const bandwidthNorm = bandwidth / sampleRate;

        const lowCutoff = Math.max(0.01, centerFreq - bandwidthNorm / 2);
        const highCutoff = Math.min(0.49, centerFreq + bandwidthNorm / 2);

        if (settings.mode === "bandpass") {
          coefficients = createBandPassFilter(
            settings.type,
            settings.order,
            lowCutoff,
            highCutoff,
            0.5
          );
        } else {
          coefficients = createBandStopFilter(
            settings.type,
            settings.order,
            lowCutoff,
            highCutoff,
            0.5
          );
        }
      } else {
        // Lowpass or Highpass
        const filterMode = settings.mode === "highpass" ? "highpass" : "lowpass";

        switch (settings.type) {
          case "butterworth":
            coefficients = designButterworthFilter(
              settings.order,
              clampedCutoff,
              filterMode
            );
            break;

          case "chebyshev1":
            // Chebyshev Type I with 0.5 dB passband ripple
            coefficients = designChebyshev1Filter(
              settings.order,
              clampedCutoff,
              0.5,
              filterMode
            );
            break;

          case "chebyshev2":
            // Chebyshev Type II with 40 dB stopband attenuation
            coefficients = designChebyshev2Filter(
              settings.order,
              clampedCutoff,
              40,
              filterMode
            );
            break;

          default:
            console.warn(`Unknown filter type: ${settings.type}, using Butterworth`);
            coefficients = designButterworthFilter(
              settings.order,
              clampedCutoff,
              filterMode
            );
        }
      }

      // Apply filter
      const filtered = applyFilter(signal, coefficients);

      // Update state
      set({
        filterSettings: settings,
        filteredSignal: filtered,
        isFilterApplied: true,
        filterCoefficients: coefficients,
      });

      console.log("✅ Filter applied successfully", {
        type: settings.type,
        mode: settings.mode,
        order: settings.order,
        cutoffFreq: settings.cutoffFreq,
        normalizedCutoff: clampedCutoff,
        signalLength: signal.length,
        filteredLength: filtered.length,
      });
    } catch (error) {
      console.error("Failed to apply filter:", error);
      set({
        filterSettings: null,
        filteredSignal: [],
        isFilterApplied: false,
        filterCoefficients: null,
      });
    }
  },

  // Clear filter
  clearFilter: () => {
    set({
      filterSettings: null,
      filteredSignal: [],
      isFilterApplied: false,
      filterCoefficients: null,
    });
    console.log("🧹 Filter cleared");
  },

  // Set filter settings (without applying)
  setFilterSettings: (settings: FilterSettings) => {
    set({ filterSettings: settings });
  },
}));
