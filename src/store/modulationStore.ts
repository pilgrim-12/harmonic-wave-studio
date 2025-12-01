/**
 * Modulation Store
 * Manages AM/FM modulation signal generation and visualization
 */

import { create } from "zustand";
import {
  ModulationConfig,
  ModulatedSignalData,
  ModulationMetrics,
  ModulationType,
  generateModulatedSignal,
  modulateSignal,
  calculateModulationMetrics,
} from "@/lib/signal/modulation";

interface ModulationState {
  // Configuration
  config: ModulationConfig;
  enabled: boolean;

  // Generated data
  signalData: ModulatedSignalData | null;
  metrics: ModulationMetrics | null;

  // Visualization settings
  showCarrier: boolean;
  showModulating: boolean;
  showModulated: boolean;
  showEnvelope: boolean;
  showInstantFreq: boolean;
  timeWindow: number;

  // Actions
  setConfig: (config: Partial<ModulationConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  generateSignal: (duration: number, sampleRate: number) => void;
  modulateFromInput: (inputSignal: number[], sampleRate: number) => void;
  clearSignal: () => void;

  // Visualization toggles
  setShowCarrier: (show: boolean) => void;
  setShowModulating: (show: boolean) => void;
  setShowModulated: (show: boolean) => void;
  setShowEnvelope: (show: boolean) => void;
  setShowInstantFreq: (show: boolean) => void;
  setTimeWindow: (window: number) => void;
}

const defaultConfig: ModulationConfig = {
  type: "AM" as ModulationType,
  carrierFrequency: 1000,        // 1 kHz carrier
  carrierAmplitude: 1.0,
  modulationIndex: 0.5,          // 50% modulation depth
  modulationFrequency: 100,      // 100 Hz modulating signal
  modulationWaveform: "sine",
  ssbMode: "upper",
};

export const useModulationStore = create<ModulationState>((set, get) => ({
  // Initial state
  config: defaultConfig,
  enabled: false,

  signalData: null,
  metrics: null,

  showCarrier: true,
  showModulating: true,
  showModulated: true,
  showEnvelope: true,
  showInstantFreq: false,
  timeWindow: 0.05, // 50ms

  // Set configuration
  setConfig: (newConfig: Partial<ModulationConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig },
    }));

    // Auto-regenerate if enabled
    const state = get();
    if (state.enabled && state.signalData) {
      const duration = state.signalData.time[state.signalData.time.length - 1];
      const sampleRate = state.signalData.time.length / duration;
      get().generateSignal(duration, sampleRate);
    }
  },

  // Enable/disable modulation
  setEnabled: (enabled: boolean) => {
    set({ enabled });
    if (!enabled) {
      set({ signalData: null, metrics: null });
    }
  },

  // Generate modulated signal
  generateSignal: (duration: number, sampleRate: number) => {
    const { config } = get();

    const signalData = generateModulatedSignal(config, duration, sampleRate);
    const metrics = calculateModulationMetrics(signalData, config);

    set({ signalData, metrics });

    console.log("📻 Modulated signal generated:", {
      type: config.type,
      carrierFreq: config.carrierFrequency,
      modFreq: config.modulationFrequency,
      modIndex: config.modulationIndex,
      bandwidth: metrics.bandwidth,
    });
  },

  // Modulate from input signal
  modulateFromInput: (inputSignal: number[], sampleRate: number) => {
    const { config } = get();

    const signalData = modulateSignal(inputSignal, config, sampleRate);
    const metrics = calculateModulationMetrics(signalData, config);

    set({ signalData, metrics });
  },

  // Clear signal
  clearSignal: () => {
    set({ signalData: null, metrics: null });
  },

  // Visualization toggles
  setShowCarrier: (show: boolean) => set({ showCarrier: show }),
  setShowModulating: (show: boolean) => set({ showModulating: show }),
  setShowModulated: (show: boolean) => set({ showModulated: show }),
  setShowEnvelope: (show: boolean) => set({ showEnvelope: show }),
  setShowInstantFreq: (show: boolean) => set({ showInstantFreq: show }),
  setTimeWindow: (window: number) => set({ timeWindow: window }),
}));
