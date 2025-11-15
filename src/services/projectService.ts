import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
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
  await deleteDoc(doc(db, "projects", projectId));
}
