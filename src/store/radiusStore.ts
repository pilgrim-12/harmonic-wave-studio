import { create } from "zustand";
import { Radius, CreateRadiusParams, UpdateRadiusParams } from "@/types/radius";

interface RadiusStore {
  radii: Radius[];
  selectedRadiusId: string | null;

  // Actions
  addRadius: (params: CreateRadiusParams) => void;
  removeRadius: (id: string) => void;
  updateRadius: (id: string, params: UpdateRadiusParams) => void;
  selectRadius: (id: string | null) => void;
  clearAllRadii: () => void;
  getRadiusByParentId: (parentId: string | null) => Radius[];
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

export const useRadiusStore = create<RadiusStore>((set, get) => ({
  radii: [],
  selectedRadiusId: null,

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
  },

  removeRadius: (id) => {
    const radii = get().radii;
    // Удаляем радиус и все его дочерние радиусы
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
  },

  updateRadius: (id, params) => {
    set({
      radii: get().radii.map((r) => (r.id === id ? { ...r, ...params } : r)),
    });
  },

  selectRadius: (id) => {
    set({ selectedRadiusId: id });
  },

  clearAllRadii: () => {
    set({ radii: [], selectedRadiusId: null });
  },

  getRadiusByParentId: (parentId) => {
    return get().radii.filter((r) => r.parentId === parentId);
  },
}));
