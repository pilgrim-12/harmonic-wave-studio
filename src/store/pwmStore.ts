/**
 * PWM Store
 * Manages PWM (ШИМ) signal generation and visualization state
 */

import { create } from "zustand";
import {
  PWMConfig,
  PWMSignalData,
  PWMMetrics,
  PWMMode,
  generatePWMSignal,
  generatePWMFromSignal,
  calculatePWMMetrics,
} from "@/lib/signal/pwmGenerator";

interface PWMState {
  // Configuration
  config: PWMConfig;
  enabled: boolean;

  // Generated data
  signalData: PWMSignalData | null;
  metrics: PWMMetrics | null;

  // Visualization settings
  showCarrier: boolean;
  showModulating: boolean;
  showPWM: boolean;
  showAverage: boolean;
  showDutyCycle: boolean;
  timeWindow: number; // Display time window in seconds

  // Actions
  setConfig: (config: Partial<PWMConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  generateSignal: (duration: number, sampleRate: number) => void;
  generateFromInputSignal: (inputSignal: number[], sampleRate: number) => void;
  clearSignal: () => void;

  // Visualization toggles
  setShowCarrier: (show: boolean) => void;
  setShowModulating: (show: boolean) => void;
  setShowPWM: (show: boolean) => void;
  setShowAverage: (show: boolean) => void;
  setShowDutyCycle: (show: boolean) => void;
  setTimeWindow: (window: number) => void;
}

const defaultConfig: PWMConfig = {
  carrierFrequency: 1000,    // 1 kHz carrier
  dutyCycle: 0.5,            // 50% duty cycle
  modulationDepth: 0.8,      // 80% modulation depth
  modulationFrequency: 50,   // 50 Hz modulation
  mode: "sine" as PWMMode,
  deadTime: 0,
  resolution: 8,
};

export const usePWMStore = create<PWMState>((set, get) => ({
  // Initial state
  config: defaultConfig,
  enabled: false,

  signalData: null,
  metrics: null,

  showCarrier: true,
  showModulating: true,
  showPWM: true,
  showAverage: true,
  showDutyCycle: false,
  timeWindow: 0.05, // 50ms default view

  // Set configuration
  setConfig: (newConfig: Partial<PWMConfig>) => {
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

  // Enable/disable PWM
  setEnabled: (enabled: boolean) => {
    set({ enabled });
    if (!enabled) {
      set({ signalData: null, metrics: null });
    }
  },

  // Generate PWM signal
  generateSignal: (duration: number, sampleRate: number) => {
    const { config } = get();

    const signalData = generatePWMSignal(config, duration, sampleRate);
    const metrics = calculatePWMMetrics(signalData, config);

    set({ signalData, metrics });

    console.log("📊 PWM signal generated:", {
      carrierFreq: config.carrierFrequency,
      dutyCycle: config.dutyCycle,
      modFreq: config.modulationFrequency,
      effectiveDuty: metrics.effectiveDutyCycle.toFixed(3),
    });
  },

  // Generate from input signal
  generateFromInputSignal: (inputSignal: number[], sampleRate: number) => {
    const { config } = get();

    const signalData = generatePWMFromSignal(
      inputSignal,
      config.carrierFrequency,
      sampleRate
    );

    const metrics = calculatePWMMetrics(signalData, config);

    set({ signalData, metrics });
  },

  // Clear signal
  clearSignal: () => {
    set({ signalData: null, metrics: null });
  },

  // Visualization toggles
  setShowCarrier: (show: boolean) => set({ showCarrier: show }),
  setShowModulating: (show: boolean) => set({ showModulating: show }),
  setShowPWM: (show: boolean) => set({ showPWM: show }),
  setShowAverage: (show: boolean) => set({ showAverage: show }),
  setShowDutyCycle: (show: boolean) => set({ showDutyCycle: show }),
  setTimeWindow: (window: number) => set({ timeWindow: window }),
}));
