import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { EnvelopeConfig, SweepConfig, LFOConfig, TimelineConfig } from "@/types/radius";

export interface Radius {
  frequency: number;
  amplitude: number;
  phase: number;
  color?: string; // hex color, e.g. "#667eea"
  // Modulation parameters (optional)
  envelope?: EnvelopeConfig;
  sweep?: SweepConfig;
  lfo?: LFOConfig;
  timeline?: TimelineConfig;
}

export interface Project {
  id?: string;
  userId: string;
  name: string;
  radii: Radius[];
  shareId?: string | null; // ✅ ДОБАВЛЕНО: ID публичной ссылки (если расшарен)
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Создать новый проект
export async function createProject(
  userId: string,
  name: string,
  radii: Radius[]
): Promise<string> {
  const projectRef = await addDoc(collection(db, "projects"), {
    userId,
    name,
    radii,
    shareId: null, // ✅ ДОБАВЛЕНО: по умолчанию не расшарен
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return projectRef.id;
}

// Получить все проекты пользователя
export async function getUserProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      radii: data.radii,
      shareId: data.shareId,
      // Convert Firestore Timestamps to JS Dates
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    };
  }) as Project[];
}

// Проверить, существует ли проект с таким именем у пользователя
export async function checkProjectNameExists(
  userId: string,
  name: string,
  excludeProjectId?: string
): Promise<boolean> {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId),
    where("name", "==", name)
  );

  const snapshot = await getDocs(q);

  // If excluding a project (for updates), filter it out
  if (excludeProjectId) {
    return snapshot.docs.some((doc) => doc.id !== excludeProjectId);
  }

  return !snapshot.empty;
}

// Обновить проект
export async function updateProject(
  projectId: string,
  name: string,
  radii: Radius[]
): Promise<void> {
  const projectRef = doc(db, "projects", projectId);

  // First get the project to check if it's shared
  const projectDoc = await getDoc(projectRef);
  const shareId = projectDoc.exists() ? projectDoc.data()?.shareId : null;

  // Update the project
  await updateDoc(projectRef, {
    name,
    radii,
    updatedAt: serverTimestamp(),
  });

  // If project is shared, sync name and radii to shared-projects
  if (shareId) {
    try {
      const sharedProjectRef = doc(db, "shared-projects", shareId);
      await updateDoc(sharedProjectRef, {
        projectName: name,
        radii,
      });
      console.log(`Synced shared project: ${shareId}`);
    } catch (error) {
      console.error("Failed to sync shared project:", error);
      // Don't fail the main update if shared sync fails
    }
  }
}

// Удалить проект
export async function deleteProject(projectId: string): Promise<void> {
  // Get the project document to check if it's shared
  const projectRef = doc(db, "projects", projectId);
  const projectDoc = await getDoc(projectRef);

  if (projectDoc.exists()) {
    const projectData = projectDoc.data();
    const shareId = projectData?.shareId;

    // If the project is shared, delete from shared-projects collection first
    if (shareId) {
      try {
        const sharedProjectRef = doc(db, "shared-projects", shareId);
        await deleteDoc(sharedProjectRef);
        console.log(`Deleted shared project: ${shareId}`);
      } catch (error) {
        console.error("Failed to delete shared project:", error);
        // Continue with project deletion even if shared project deletion fails
      }
    }
  }

  // Delete the project itself
  await deleteDoc(projectRef);
}
