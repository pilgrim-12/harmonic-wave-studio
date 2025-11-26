import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GraphVisibilityState {
  showOriginalSignal: boolean;
  showNoisySignal: boolean;
  showFilteredSignal: boolean;
  showSpectrum: boolean;

  // Actions
  toggleOriginalSignal: () => void;
  toggleNoisySignal: () => void;
  toggleFilteredSignal: () => void;
  toggleSpectrum: () => void;
  setGraphVisibility: (
    original: boolean,
    noisy: boolean,
    filtered: boolean,
    spectrum: boolean
  ) => void;
}

export const useGraphVisibilityStore = create<GraphVisibilityState>()(
  persist(
    (set) => ({
      // Initial state - show all graphs by default
      showOriginalSignal: true,
      showNoisySignal: true,
      showFilteredSignal: true,
      showSpectrum: false,

      // Actions
      toggleOriginalSignal: () =>
        set((state) => ({ showOriginalSignal: !state.showOriginalSignal })),

      toggleNoisySignal: () =>
        set((state) => ({ showNoisySignal: !state.showNoisySignal })),

      toggleFilteredSignal: () =>
        set((state) => ({ showFilteredSignal: !state.showFilteredSignal })),

      toggleSpectrum: () =>
        set((state) => ({ showSpectrum: !state.showSpectrum })),

      setGraphVisibility: (original, noisy, filtered, spectrum) =>
        set({
          showOriginalSignal: original,
          showNoisySignal: noisy,
          showFilteredSignal: filtered,
          showSpectrum: spectrum,
        }),
    }),
    {
      name: "graph-visibility-storage",
    }
  )
);
