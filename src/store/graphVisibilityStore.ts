import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GraphVisibilityState {
  showOriginalSignal: boolean;
  showNoisySignal: boolean;
  showFilteredSignal: boolean;

  // Actions
  toggleOriginalSignal: () => void;
  toggleNoisySignal: () => void;
  toggleFilteredSignal: () => void;
  setGraphVisibility: (
    original: boolean,
    noisy: boolean,
    filtered: boolean
  ) => void;
}

export const useGraphVisibilityStore = create<GraphVisibilityState>()(
  persist(
    (set) => ({
      // Initial state - show all graphs by default
      showOriginalSignal: true,
      showNoisySignal: true,
      showFilteredSignal: true,

      // Actions
      toggleOriginalSignal: () =>
        set((state) => ({ showOriginalSignal: !state.showOriginalSignal })),

      toggleNoisySignal: () =>
        set((state) => ({ showNoisySignal: !state.showNoisySignal })),

      toggleFilteredSignal: () =>
        set((state) => ({ showFilteredSignal: !state.showFilteredSignal })),

      setGraphVisibility: (original, noisy, filtered) =>
        set({
          showOriginalSignal: original,
          showNoisySignal: noisy,
          showFilteredSignal: filtered,
        }),
    }),
    {
      name: "graph-visibility-storage",
    }
  )
);
