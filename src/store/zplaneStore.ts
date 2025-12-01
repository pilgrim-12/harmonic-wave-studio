/**
 * Z-Plane Store
 * Manages poles/zeros visualization state
 */

import { create } from "zustand";
import {
  ZPlaneData,
  ZPlaneMetrics,
  calculatePolesZeros,
  calculateZPlaneMetrics,
} from "@/lib/signal/zplane";
import { FilterCoefficients } from "@/lib/signal/digitalFilters";

interface ZPlaneState {
  // Data
  zplaneData: ZPlaneData | null;
  metrics: ZPlaneMetrics | null;

  // Visualization settings
  showUnitCircle: boolean;
  showGrid: boolean;
  showFrequencyMarkers: boolean;
  showStabilityRegion: boolean;
  zoomLevel: number;

  // Actions
  calculateFromCoefficients: (coefficients: FilterCoefficients, sampleRate: number) => void;
  clearData: () => void;
  setShowUnitCircle: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowFrequencyMarkers: (show: boolean) => void;
  setShowStabilityRegion: (show: boolean) => void;
  setZoomLevel: (zoom: number) => void;
}

export const useZPlaneStore = create<ZPlaneState>((set) => ({
  // Initial state
  zplaneData: null,
  metrics: null,

  showUnitCircle: true,
  showGrid: true,
  showFrequencyMarkers: true,
  showStabilityRegion: false,
  zoomLevel: 1.5,

  // Calculate poles and zeros from filter coefficients
  calculateFromCoefficients: (coefficients: FilterCoefficients, sampleRate: number) => {
    const zplaneData = calculatePolesZeros(coefficients);
    const metrics = calculateZPlaneMetrics(zplaneData, sampleRate);

    set({ zplaneData, metrics });

    console.log("📍 Z-Plane calculated:", {
      poles: zplaneData.poles.length,
      zeros: zplaneData.zeros.length,
      isStable: zplaneData.isStable,
      stabilityMargin: zplaneData.stabilityMargin.toFixed(4),
    });
  },

  // Clear data
  clearData: () => {
    set({ zplaneData: null, metrics: null });
  },

  // Visualization toggles
  setShowUnitCircle: (show: boolean) => set({ showUnitCircle: show }),
  setShowGrid: (show: boolean) => set({ showGrid: show }),
  setShowFrequencyMarkers: (show: boolean) => set({ showFrequencyMarkers: show }),
  setShowStabilityRegion: (show: boolean) => set({ showStabilityRegion: show }),
  setZoomLevel: (zoom: number) => set({ zoomLevel: Math.max(0.5, Math.min(3, zoom)) }),
}));
