import { create } from "zustand";
import { SimulationSettings, SimulationState } from "@/types/simulation";

interface SignalDataPoint {
  time: number;
  y: number;
}

interface SimulationStore extends SimulationState {
  settings: SimulationSettings;
  activeTrackingRadiusId: string | null;
  signalData: SignalDataPoint[]; // ⭐ NEW

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setCurrentTime: (time: number) => void;
  updateFps: (fps: number) => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  setActiveTrackingRadius: (radiusId: string | null) => void;
  setSignalData: (data: SignalDataPoint[]) => void; // ⭐ NEW
}

const DEFAULT_SETTINGS: SimulationSettings = {
  animationSpeed: 1,
  graphDuration: 10,
  showTrail: true,
  trailLength: 100,
  showAxes: true,
  showGrid: true,
  gridSize: 50,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  // Initial state
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  fps: 0,
  lastUpdateTime: 0,
  settings: DEFAULT_SETTINGS,
  activeTrackingRadiusId: null,
  signalData: [], // ⭐ NEW

  play: () => {
    set({
      isPlaying: true,
      isPaused: false,
      lastUpdateTime: performance.now(),
    });
  },

  pause: () => {
    set({ isPlaying: false, isPaused: true });
  },

  stop: () => {
    set({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
  },

  reset: () => {
    set({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      fps: 0,
      lastUpdateTime: 0,
      signalData: [], // ⭐ NEW - Clear signal data on reset
    });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  updateFps: (fps) => {
    set({ fps });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  setActiveTrackingRadius: (radiusId) => {
    set({ activeTrackingRadiusId: radiusId });
  },

  setSignalData: (data) => {
    set({ signalData: data }); // ⭐ NEW
  },
}));
