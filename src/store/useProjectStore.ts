import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectStore {
  currentProjectId: string | null;
  currentProjectName: string;

  setCurrentProject: (id: string | null, name: string) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProjectId: null,
      currentProjectName: "Untitled Project",

      setCurrentProject: (id, name) =>
        set({ currentProjectId: id, currentProjectName: name }),

      clearProject: () =>
        set({
          currentProjectId: null,
          currentProjectName: "Untitled Project",
        }),
    }),
    {
      name: "project-storage", // Уникальное имя для localStorage
    }
  )
);
