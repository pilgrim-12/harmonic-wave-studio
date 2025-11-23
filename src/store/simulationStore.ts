import { create } from "zustand";
import { SimulationSettings, SimulationState } from "@/types/simulation";
import { useRadiusStore } from "./radiusStore";

interface SignalDataPoint {
  time: number;
  y: number;
}

interface SimulationStore extends SimulationState {
  settings: SimulationSettings;
  activeTrackingRadiusId: string | null;
  signalData: SignalDataPoint[];
  highResSignal: number[]; // NEW: High-resolution signal buffer

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
  getSignalYValues: () => number[];
  generateHighResSignal: () => void; // NEW: Generate signal at high sample rate
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
  signalSampleRate: 500, // NEW: Default 500 Hz
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
  highResSignal: [],

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
      highResSignal: [],
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

    // Regenerate high-res signal if sample rate changed
    if (newSettings.signalSampleRate !== undefined) {
      get().generateHighResSignal();
    }
  },

  setActiveTrackingRadius: (radiusId) => {
    set({ activeTrackingRadiusId: radiusId });
  },

  setSignalData: (data) => {
    set({ signalData: data });
  },

  // Get Y values from signal data (legacy for 30 FPS)
  getSignalYValues: () => {
    const { signalData } = get();
    return signalData.map((point) => point.y);
  },

  // NEW: Generate high-resolution signal
  generateHighResSignal: () => {
    const { settings, currentTime } = get();
    const { radii } = useRadiusStore.getState();

    if (radii.length === 0) {
      set({ highResSignal: [] });
      return;
    }

    const { signalSampleRate, graphDuration } = settings;
    const totalSamples = Math.floor(graphDuration * signalSampleRate);
    const signal: number[] = [];

    // Generate signal at high sample rate
    for (let i = 0; i < totalSamples; i++) {
      const t = currentTime - graphDuration + i / signalSampleRate;

      if (t < 0) {
        signal.push(0);
        continue;
      }

      // Calculate Y coordinate from all radii
      let y = 0;
      let cumulativeAngle = 0;

      for (const radius of radii) {
        const direction = radius.direction === "counterclockwise" ? 1 : -1;
        const angle =
          radius.initialAngle +
          direction * radius.rotationSpeed * t * 2 * Math.PI;
        cumulativeAngle += angle;
        y += radius.length * Math.sin(cumulativeAngle);
      }

      signal.push(y);
    }

    set({ highResSignal: signal });
  },
}));
