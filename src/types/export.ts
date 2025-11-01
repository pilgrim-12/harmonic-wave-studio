import { Radius } from "./radius";

export interface ProjectExport {
  version: string;
  createdAt: string;
  radii: Radius[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  showGrid: boolean;
  gridSize: number;
  showAxes: boolean;
  showTrail: boolean;
  trailLength: number;
  animationSpeed: number;
  graphDuration: number;
}
