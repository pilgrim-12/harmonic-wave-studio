import { create } from "zustand";
import { SimulationSettings, SimulationState } from "@/types/simulation";

interface SignalDataPoint {
  time: number;
  y: number;
}

interface SimulationStore extends SimulationState {
  settings: SimulationSettings;
  activeTrackingRadiusId: string | null;
  signalData: SignalDataPoint[];

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setCurrentTime: (time: number) => void;
  updateFps: (fps: number) => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  setActiveTrackingRadius: (radiusId: string | null) => void;
  setSignalData: (data: SignalDataPoint[]) => void;
  getSignalYValues: () => number[]; // NEW: Get Y values for signal processing
}

const DEFAULT_SETTINGS: SimulationSettings = {
  animationSpeed: 1,
  graphDuration: 10,
  showTrail: true,
  trailLength: 100,
  showAxes: true,
  showGrid: true,
  gridSize: 50,
  zoom: 1.0,
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  fps: 0,
  lastUpdateTime: 0,
  settings: DEFAULT_SETTINGS,
  activeTrackingRadiusId: null,
  signalData: [],

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
      signalData: [],
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
    set({ signalData: data });
  },

  // NEW: Extract Y values from signal data
  getSignalYValues: () => {
    const { signalData } = get();
    return signalData.map((point) => point.y);
  },
}));
