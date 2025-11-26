import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GraphVisibilityState {
  showOriginalSignal: boolean;
  showNoisySignal: boolean;
  showFilteredSignal: boolean;
  showSpectrum: boolean;
  showDecomposition: boolean;

  // Actions
  toggleOriginalSignal: () => void;
  toggleNoisySignal: () => void;
  toggleFilteredSignal: () => void;
  toggleSpectrum: () => void;
  toggleDecomposition: () => void;
  setGraphVisibility: (
    original: boolean,
    noisy: boolean,
    filtered: boolean,
    spectrum: boolean,
    decomposition: boolean
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
      showDecomposition: false,

      // Actions
      toggleOriginalSignal: () =>
        set((state) => ({ showOriginalSignal: !state.showOriginalSignal })),

      toggleNoisySignal: () =>
        set((state) => ({ showNoisySignal: !state.showNoisySignal })),

      toggleFilteredSignal: () =>
        set((state) => ({ showFilteredSignal: !state.showFilteredSignal })),

      toggleSpectrum: () =>
        set((state) => ({ showSpectrum: !state.showSpectrum })),

      toggleDecomposition: () =>
        set((state) => ({ showDecomposition: !state.showDecomposition })),

      setGraphVisibility: (original, noisy, filtered, spectrum, decomposition) =>
        set({
          showOriginalSignal: original,
          showNoisySignal: noisy,
          showFilteredSignal: filtered,
          showSpectrum: spectrum,
          showDecomposition: decomposition,
        }),
    }),
    {
      name: "graph-visibility-storage",
    }
  )
);
