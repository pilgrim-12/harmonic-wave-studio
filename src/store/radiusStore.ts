import { create } from "zustand";
import { Radius, CreateRadiusParams, UpdateRadiusParams } from "@/types/radius";

// ⭐ History state snapshot
interface HistorySnapshot {
  radii: Radius[];
  selectedRadiusId: string | null;
}

interface RadiusStore {
  radii: Radius[];
  selectedRadiusId: string | null;

  // ⭐ History stacks
  history: HistorySnapshot[];
  historyIndex: number;

  // Actions
  addRadius: (params: CreateRadiusParams) => string;
  removeRadius: (id: string) => void;
  updateRadius: (id: string, params: UpdateRadiusParams) => void;
  selectRadius: (id: string | null) => void;
  clearAllRadii: () => void;
  clearRadii: () => void;
  getRadiusByParentId: (parentId: string | null) => Radius[];

  // ⭐ Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Генератор уникальных ID
const generateId = () =>
  `radius_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Дефолтные значения для нового радиуса
const DEFAULT_RADIUS_VALUES = {
  length: 100,
  initialAngle: 0,
  rotationSpeed: 1,
  direction: "counterclockwise" as const,
  color: "#667eea",
  isActive: true,
};

// ⭐ Helper: Create snapshot
const createSnapshot = (
  radii: Radius[],
  selectedRadiusId: string | null
): HistorySnapshot => ({
  radii: JSON.parse(JSON.stringify(radii)), // Deep clone
  selectedRadiusId,
});

// ⭐ Helper: Save to history
const saveToHistory = (
  get: () => RadiusStore,
  set: (partial: Partial<RadiusStore>) => void
) => {
  const { radii, selectedRadiusId, history, historyIndex } = get();

  // Remove any "future" history if we're not at the end
  const newHistory = history.slice(0, historyIndex + 1);

  // Add current state to history
  newHistory.push(createSnapshot(radii, selectedRadiusId));

  // Limit history to 50 items
  const maxHistory = 50;
  if (newHistory.length > maxHistory) {
    newHistory.shift();
  }

  set({
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
};

export const useRadiusStore = create<RadiusStore>((set, get) => ({
  radii: [],
  selectedRadiusId: null,

  // ⭐ Initialize history with empty state
  history: [{ radii: [], selectedRadiusId: null }],
  historyIndex: 0,

  addRadius: (params) => {
    const radii = get().radii;
    const order = radii.length;
    const name = params.name || `Radius ${order + 1}`;

    const newRadius: Radius = {
      id: generateId(),
      parentId: params.parentId,
      name,
      length: params.length ?? DEFAULT_RADIUS_VALUES.length,
      initialAngle: params.initialAngle ?? DEFAULT_RADIUS_VALUES.initialAngle,
      currentAngle: params.initialAngle ?? DEFAULT_RADIUS_VALUES.initialAngle,
      rotationSpeed:
        params.rotationSpeed ?? DEFAULT_RADIUS_VALUES.rotationSpeed,
      direction: params.direction ?? DEFAULT_RADIUS_VALUES.direction,
      color: params.color ?? DEFAULT_RADIUS_VALUES.color,
      order,
      isActive: DEFAULT_RADIUS_VALUES.isActive,
    };

    set({ radii: [...radii, newRadius] });
    saveToHistory(get, set); // ⭐ Save to history
    return newRadius.id;
  },

  removeRadius: (id) => {
    const radii = get().radii;
    const toRemove = new Set<string>();

    const findChildren = (parentId: string) => {
      toRemove.add(parentId);
      radii.forEach((r) => {
        if (r.parentId === parentId) {
          findChildren(r.id);
        }
      });
    };

    findChildren(id);

    const newRadii = radii.filter((r) => !toRemove.has(r.id));
    set({
      radii: newRadii,
      selectedRadiusId:
        get().selectedRadiusId === id ? null : get().selectedRadiusId,
    });
    saveToHistory(get, set); // ⭐ Save to history
  },

  updateRadius: (id, params) => {
    set({
      radii: get().radii.map((r) => (r.id === id ? { ...r, ...params } : r)),
    });
    saveToHistory(get, set); // ⭐ Save to history
  },

  selectRadius: (id) => {
    // ⭐ Don't save selection to history (too noisy)
    set({ selectedRadiusId: id });
  },

  clearAllRadii: () => {
    set({ radii: [], selectedRadiusId: null });
    saveToHistory(get, set); // ⭐ Save to history
  },

  clearRadii: () => {
    set({ radii: [], selectedRadiusId: null });
    saveToHistory(get, set); // ⭐ Save to history
  },

  getRadiusByParentId: (parentId) => {
    return get().radii.filter((r) => r.parentId === parentId);
  },

  // ⭐ Undo: Go back in history
  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const snapshot = history[newIndex];

      set({
        radii: JSON.parse(JSON.stringify(snapshot.radii)), // Deep clone
        selectedRadiusId: snapshot.selectedRadiusId,
        historyIndex: newIndex,
      });
    }
  },

  // ⭐ Redo: Go forward in history
  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const snapshot = history[newIndex];

      set({
        radii: JSON.parse(JSON.stringify(snapshot.radii)), // Deep clone
        selectedRadiusId: snapshot.selectedRadiusId,
        historyIndex: newIndex,
      });
    }
  },

  // ⭐ Check if undo is available
  canUndo: () => {
    return get().historyIndex > 0;
  },

  // ⭐ Check if redo is available
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));
