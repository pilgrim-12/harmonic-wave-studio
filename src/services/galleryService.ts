import {
  collection,
  query,
  where,
  limit,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { SharedProject } from "@/types/share";

/**
 * Sort options for gallery
 */
export type GallerySortOption = "recent" | "popular" | "views";

/**
 * Gallery filter options
 */
export interface GalleryFilters {
  sortBy: GallerySortOption;
  searchQuery?: string;
  tags?: string[];
  featured?: boolean;
}

/**
 * Paginated gallery results
 */
export interface GalleryResult {
  projects: SharedProject[];
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot | null;
}

/**
 * Fetch shared projects for gallery with filters
 * @param filters - Gallery filters (sort, search, tags)
 * @param pageSize - Number of projects per page (default: 12)
 * @param lastDoc - Last document for pagination
 */
export async function getGalleryProjects(
  filters: GalleryFilters,
  pageSize: number = 12
): Promise<GalleryResult> {
  try {
    const { sortBy, searchQuery, tags } = filters;

    // Simplified query: only isDiscoverable filter
    // Sorting will be done client-side to avoid index requirements
    const q = query(
      collection(db, "shared-projects"),
      where("isDiscoverable", "==", true),
      limit(100) // Get more docs for client-side sorting
    );

    // Execute query
    const snapshot = await getDocs(q);

    // Convert to SharedProject array
    let projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SharedProject[];

    // Client-side sorting (no index needed!)
    switch (sortBy) {
      case "recent":
        projects.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        break;
      case "popular":
      case "views":
        projects.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
    }

    // Client-side filtering for search
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      projects = projects.filter((project) => {
        const nameMatch = project.projectName
          .toLowerCase()
          .includes(searchLower);
        const descMatch = project.description
          ?.toLowerCase()
          .includes(searchLower);
        const tagMatch = project.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        const authorMatch = project.userName
          .toLowerCase()
          .includes(searchLower);

        return nameMatch || descMatch || tagMatch || authorMatch;
      });
    }

    // Client-side filtering for tags
    if (tags && tags.length > 0) {
      projects = projects.filter((project) => {
        return tags.some((tag) =>
          project.tags.some((projectTag) =>
            projectTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Client-side pagination
    const startIndex = 0; // For now, no pagination
    const endIndex = Math.min(startIndex + pageSize, projects.length);
    const paginatedProjects = projects.slice(startIndex, endIndex);

    const hasMore = endIndex < projects.length;

    return {
      projects: paginatedProjects,
      hasMore,
      lastDoc: null, // Client-side pagination doesn't use Firestore cursor
    };
  } catch (error) {
    console.error("Error fetching gallery projects:", error);
    return {
      projects: [],
      hasMore: false,
      lastDoc: null,
    };
  }
}

/**
 * Get featured projects (high engagement, top 6)
 * @param count - Number of featured projects to return (default: 6)
 */
export async function getFeaturedProjects(
  count: number = 6
): Promise<SharedProject[]> {
  try {
    // Simplified query without orderBy to avoid index
    const q = query(
      collection(db, "shared-projects"),
      where("isDiscoverable", "==", true),
      limit(100) // Get more docs for client-side sorting
    );

    const snapshot = await getDocs(q);

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SharedProject[];

    // Client-side sorting by viewCount
    projects.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    // Return top N
    return projects.slice(0, count);
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return [];
  }
}

/**
 * Get popular tags from shared projects
 * @param limitCount - Maximum number of tags to return (default: 10)
 */
export async function getPopularTags(
  limitCount: number = 10
): Promise<string[]> {
  try {
    const q = query(
      collection(db, "shared-projects"),
      where("isDiscoverable", "==", true)
    );

    const snapshot = await getDocs(q);

    // Count tag occurrences
    const tagCounts = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const project = doc.data() as SharedProject;
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          tagCounts.set(lowerTag, (tagCounts.get(lowerTag) || 0) + 1);
        });
      }
    });

    // Sort by count and return top tags
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limitCount)
      .map(([tag]) => tag);
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return [];
  }
}

/**
 * Get gallery statistics
 */
export async function getGalleryStats(): Promise<{
  totalProjects: number;
  totalViews: number;
  totalAuthors: number;
}> {
  try {
    const q = query(
      collection(db, "shared-projects"),
      where("isDiscoverable", "==", true)
    );

    const snapshot = await getDocs(q);

    let totalViews = 0;
    const authors = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const project = doc.data() as SharedProject;
      totalViews += project.viewCount || 0;
      authors.add(project.userId);
    });

    return {
      totalProjects: snapshot.size,
      totalViews,
      totalAuthors: authors.size,
    };
  } catch (error) {
    console.error("Error fetching gallery stats:", error);
    return {
      totalProjects: 0,
      totalViews: 0,
      totalAuthors: 0,
    };
  }
}
