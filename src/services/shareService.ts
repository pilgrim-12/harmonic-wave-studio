import {
  collection,
  getDoc,
  setDoc, // ✅ ИЗМЕНЕНО: addDoc → setDoc
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { SharedProject, ShareProjectData } from "@/types/share";
import { Project } from "./projectService";

/**
 * Генерирует уникальный ID для share
 */
function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Расшарить проект (создать публичную ссылку)
 */
export async function shareProject(
  project: Project,
  userName: string,
  shareData: ShareProjectData
): Promise<string> {
  // Валидация
  if (shareData.description && shareData.description.length > 200) {
    throw new Error("Description is too long (max 200 characters)");
  }

  if (!project.id) {
    throw new Error("Project must have an ID");
  }

  // Если уже расшарен - используем существующий shareId
  if (project.shareId) {
    // Обновляем существующий share
    await updateSharedProject(project.shareId, shareData);
    return project.shareId;
  }

  // Создаем новый share
  const shareId = generateShareId();

  const sharedProjectData = {
    id: shareId,
    projectId: project.id,
    userId: project.userId,
    userName: userName,
    projectName: shareData.projectName,
    description: shareData.description || "",
    tags: shareData.tags || [],
    radii: project.radii,
    settings: {
      animationSpeed: 1,
      showGrid: true,
      showAxes: true,
      showTrail: true,
      trailLength: 1000,
      zoom: 1,
      gridSize: 50,
      graphDuration: 4,
    },
    createdAt: serverTimestamp(),
    viewCount: 0,
    isDiscoverable: shareData.makeDiscoverable || false,
  };

  // ✅ ИЗМЕНЕНО: Используем setDoc с нашим shareId
  const sharedProjectRef = doc(db, "shared-projects", shareId);
  await setDoc(sharedProjectRef, sharedProjectData);

  // Обновляем оригинальный проект
  const projectRef = doc(db, "projects", project.id);
  await updateDoc(projectRef, {
    shareId: shareId,
  });

  return shareId;
}

/**
 * Получить расшаренный проект по ID
 */
export async function getSharedProject(
  shareId: string
): Promise<SharedProject | null> {
  const sharedProjectRef = doc(db, "shared-projects", shareId);
  const snapshot = await getDoc(sharedProjectRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as SharedProject;
}

/**
 * Обновить расшаренный проект (description, tags, radii)
 */
export async function updateSharedProject(
  shareId: string,
  shareData: ShareProjectData
): Promise<void> {
  const sharedProjectRef = doc(db, "shared-projects", shareId);

  await updateDoc(sharedProjectRef, {
    projectName: shareData.projectName,
    description: shareData.description || "",
    tags: shareData.tags || [],
    isDiscoverable: shareData.makeDiscoverable || false,
  });
}

/**
 * Отозвать share (удалить публичную ссылку)
 */
export async function unshareProject(
  projectId: string,
  shareId: string
): Promise<void> {
  // Удаляем из shared-projects
  const sharedProjectRef = doc(db, "shared-projects", shareId);
  await deleteDoc(sharedProjectRef);

  // Обновляем оригинальный проект
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    shareId: null,
  });
}

/**
 * Увеличить счетчик просмотров
 */
export async function incrementViewCount(shareId: string): Promise<void> {
  const sharedProjectRef = doc(db, "shared-projects", shareId);
  await updateDoc(sharedProjectRef, {
    viewCount: increment(1),
  });
}

/**
 * Клонировать расшаренный проект к себе
 */
export async function cloneSharedProject(
  shareId: string,
  userId: string
): Promise<string> {
  // Получаем расшаренный проект
  const sharedProject = await getSharedProject(shareId);

  if (!sharedProject) {
    throw new Error("Shared project not found");
  }

  // Создаем новый проект для пользователя
  const projectRef = doc(collection(db, "projects")); // Генерируем ID
  await setDoc(projectRef, {
    userId: userId,
    name: `${sharedProject.projectName} (cloned)`,
    radii: sharedProject.radii,
    shareId: null, // Клон не расшарен по умолчанию
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return projectRef.id;
}
