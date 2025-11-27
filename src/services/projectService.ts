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

export interface Radius {
  frequency: number;
  amplitude: number;
  phase: number;
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
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

// Обновить проект
export async function updateProject(
  projectId: string,
  name: string,
  radii: Radius[]
): Promise<void> {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    name,
    radii,
    updatedAt: serverTimestamp(),
  });
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
