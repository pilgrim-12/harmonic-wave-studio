import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GraphVisibilityState {
  showOriginalSignal: boolean;
  showNoisySignal: boolean;
  showFilteredSignal: boolean;
  showSpectrum: boolean;
  showDecomposition: boolean;
  showSpectrogram: boolean;
  showFrequencyResponse: boolean;

  // Actions
  toggleOriginalSignal: () => void;
  toggleNoisySignal: () => void;
  toggleFilteredSignal: () => void;
  toggleSpectrum: () => void;
  toggleDecomposition: () => void;
  toggleSpectrogram: () => void;
  toggleFrequencyResponse: () => void;
  setGraphVisibility: (
    original: boolean,
    noisy: boolean,
    filtered: boolean,
    spectrum: boolean,
    decomposition: boolean,
    spectrogram?: boolean,
    frequencyResponse?: boolean
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
      showSpectrogram: false,
      showFrequencyResponse: false,

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

      toggleSpectrogram: () =>
        set((state) => ({ showSpectrogram: !state.showSpectrogram })),

      toggleFrequencyResponse: () =>
        set((state) => ({ showFrequencyResponse: !state.showFrequencyResponse })),

      setGraphVisibility: (original, noisy, filtered, spectrum, decomposition, spectrogram = false, frequencyResponse = false) =>
        set({
          showOriginalSignal: original,
          showNoisySignal: noisy,
          showFilteredSignal: filtered,
          showSpectrum: spectrum,
          showDecomposition: decomposition,
          showSpectrogram: spectrogram,
          showFrequencyResponse: frequencyResponse,
        }),
    }),
    {
      name: "graph-visibility-storage",
    }
  )
);
