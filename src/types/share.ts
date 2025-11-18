import { Timestamp } from "firebase/firestore";
import { Radius } from "@/services/projectService"; // ✅ ИСПРАВЛЕНО: импорт из projectService

export interface ShareProjectData {
  projectName: string;
  description?: string; // max 200 chars
  tags?: string[];
  makeDiscoverable?: boolean;
}

export interface SharedProject {
  id: string; // shareId
  projectId: string; // original project ID
  userId: string; // author ID
  userName: string; // author name
  projectName: string;
  description: string;
  tags: string[];
  radii: Radius[]; // ✅ Теперь это Radius { frequency, amplitude, phase }
  settings: {
    animationSpeed: number;
    showGrid: boolean;
    showAxes: boolean;
    showTrail: boolean;
    trailLength: number;
    zoom: number;
    gridSize: number;
    graphDuration: number;
  };
  createdAt: Timestamp;
  viewCount: number;
  isDiscoverable: boolean;
}
