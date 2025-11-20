"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SharedProject } from "@/types/share";
import {
  getGalleryProjects,
  GalleryFilters,
  GallerySortOption,
} from "@/services/galleryService";
import { ProjectCard } from "./ProjectCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GalleryGridProps {
  searchQuery: string;
  sortBy: GallerySortOption;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  searchQuery,
  sortBy,
}) => {
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Load initial projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const filters: GalleryFilters = {
        sortBy,
        searchQuery: searchQuery.trim() || undefined,
      };

      const result = await getGalleryProjects(filters, 12);
      setProjects(result.projects);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy]);

  // Load more projects (pagination)
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const filters: GalleryFilters = {
        sortBy,
        searchQuery: searchQuery.trim() || undefined,
      };

      const result = await getGalleryProjects(filters, 12);
      setProjects((prev) => [...prev, ...result.projects]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more projects:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Reload when filters change
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-80 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No projects found
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : "No projects available yet"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="secondary"
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* End message */}
      {!hasMore && projects.length > 12 && (
        <p className="text-center text-gray-500 text-sm">
          You&apos;ve reached the end! 🎉
        </p>
      )}
    </div>
  );
};
