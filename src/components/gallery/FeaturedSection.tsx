"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { SharedProject } from "@/types/share";
import { getFeaturedProjects } from "@/services/galleryService";
import { ProjectCard } from "./ProjectCard";

export const FeaturedSection: React.FC = () => {
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const data = await getFeaturedProjects(6);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load featured projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Star size={20} className="text-[#667eea]" />
          <h2 className="text-xl font-bold text-white">Featured Projects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Star size={20} className="text-[#667eea]" />
        <h2 className="text-xl font-bold text-white">Featured Projects</h2>
        <span className="text-sm text-gray-500">
          (Top {projects.length} by views)
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
