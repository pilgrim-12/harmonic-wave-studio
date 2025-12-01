/**
 * Frequency Response Store
 * Manages AFR (АЧХ) and PFR (ФЧХ) visualization state
 */

import { create } from "zustand";
import {
  FrequencyResponseData,
  calculateFrequencyResponse,
  find3dBCutoff,
  findBandwidth,
  calculateQFactor,
} from "@/lib/signal/frequencyResponse";
import { FilterCoefficients } from "@/lib/signal/digitalFilters";

export type ResponseViewMode = "magnitude" | "phase" | "both" | "groupDelay";
export type ScaleMode = "linear" | "log";

export interface FrequencyResponseMetrics {
  cutoff3dB: number | null;      // -3dB cutoff frequency
  bandwidth: {
    lower: number;
    upper: number;
    bandwidth: number;
  } | null;
  qFactor: number | null;        // Quality factor
  dcGain: number;                // Gain at DC (0 Hz) in dB
  peakGain: number;              // Maximum gain in dB
  peakFrequency: number;         // Frequency of maximum gain
}

interface FrequencyResponseState {
  // Response data
  responseData: FrequencyResponseData | null;
  metrics: FrequencyResponseMetrics | null;

  // View settings
  viewMode: ResponseViewMode;
  frequencyScale: ScaleMode;
  showGrid: boolean;
  showMarkers: boolean;
  showCutoffLine: boolean;

  // Frequency range
  minFrequency: number;  // Hz
  maxFrequency: number;  // Hz
  numPoints: number;

  // Sample rate (for normalization)
  sampleRate: number;

  // Actions
  calculateResponse: (coefficients: FilterCoefficients, sampleRate: number) => void;
  clearResponse: () => void;
  setViewMode: (mode: ResponseViewMode) => void;
  setFrequencyScale: (scale: ScaleMode) => void;
  setShowGrid: (show: boolean) => void;
  setShowMarkers: (show: boolean) => void;
  setShowCutoffLine: (show: boolean) => void;
  setFrequencyRange: (min: number, max: number) => void;
  setNumPoints: (points: number) => void;
}

export const useFrequencyResponseStore = create<FrequencyResponseState>((set, get) => ({
  // Initial state
  responseData: null,
  metrics: null,

  viewMode: "both",
  frequencyScale: "log",
  showGrid: true,
  showMarkers: true,
  showCutoffLine: true,

  minFrequency: 0.01,
  maxFrequency: 50,
  numPoints: 512,

  sampleRate: 100,

  // Calculate frequency response from filter coefficients
  calculateResponse: (coefficients: FilterCoefficients, sampleRate: number) => {
    const state = get();

    // Normalize frequency range
    const minNorm = state.minFrequency / sampleRate;
    const maxNorm = Math.min(state.maxFrequency / sampleRate, 0.499);

    const responseData = calculateFrequencyResponse(coefficients, {
      numPoints: state.numPoints,
      minFreq: Math.max(0.001, minNorm),
      maxFreq: maxNorm,
      logScale: state.frequencyScale === "log",
      sampleRate: sampleRate,
    });

    // Calculate metrics
    const cutoff3dB = find3dBCutoff(responseData);
    const bandwidth = findBandwidth(responseData);
    const qFactor = calculateQFactor(responseData);

    const dcGain = responseData.magnitude[0];
    const peakGain = Math.max(...responseData.magnitude);
    const peakIdx = responseData.magnitude.indexOf(peakGain);
    const peakFrequency = responseData.frequencies[peakIdx];

    const metrics: FrequencyResponseMetrics = {
      cutoff3dB,
      bandwidth,
      qFactor,
      dcGain,
      peakGain,
      peakFrequency,
    };

    set({
      responseData,
      metrics,
      sampleRate,
    });

    console.log("📊 Frequency response calculated:", {
      numPoints: responseData.frequencies.length,
      freqRange: `${responseData.frequencies[0].toFixed(2)} - ${responseData.frequencies[responseData.frequencies.length - 1].toFixed(2)} Hz`,
      cutoff3dB: cutoff3dB?.toFixed(2),
      dcGain: dcGain.toFixed(2),
    });
  },

  // Clear response
  clearResponse: () => {
    set({
      responseData: null,
      metrics: null,
    });
  },

  // View settings
  setViewMode: (mode: ResponseViewMode) => {
    set({ viewMode: mode });
  },

  setFrequencyScale: (scale: ScaleMode) => {
    set({ frequencyScale: scale });
    // Recalculate if we have data
    const state = get();
    if (state.responseData) {
      // Trigger recalculation would need coefficients, handled by parent component
    }
  },

  setShowGrid: (show: boolean) => {
    set({ showGrid: show });
  },

  setShowMarkers: (show: boolean) => {
    set({ showMarkers: show });
  },

  setShowCutoffLine: (show: boolean) => {
    set({ showCutoffLine: show });
  },

  setFrequencyRange: (min: number, max: number) => {
    set({
      minFrequency: Math.max(0.01, min),
      maxFrequency: max,
    });
  },

  setNumPoints: (points: number) => {
    set({ numPoints: Math.max(64, Math.min(2048, points)) });
  },
}));
