import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Radius } from "@/services/projectService";

interface ProjectStore {
  currentProjectId: string | null;
  currentProjectName: string;
  radii: Radius[];

  setCurrentProject: (id: string | null, name: string, radii: Radius[]) => void;
  setRadii: (radii: Radius[]) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProjectId: null,
      currentProjectName: "Untitled Project",
      radii: [],

      setCurrentProject: (id, name, radii) =>
        set({ currentProjectId: id, currentProjectName: name, radii }),

      setRadii: (radii) => set({ radii }),

      clearProject: () =>
        set({
          currentProjectId: null,
          currentProjectName: "Untitled Project",
          radii: [],
        }),
    }),
    {
      name: "project-storage", // Уникальное имя для localStorage
    }
  )
);
