import { create } from "zustand";
import { SimulationSettings, SimulationState } from "@/types/simulation";

interface SimulationStore extends SimulationState {
  settings: SimulationSettings;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setCurrentTime: (time: number) => void;
  updateFps: (fps: number) => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
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
}));
