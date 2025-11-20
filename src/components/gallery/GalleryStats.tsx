"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Eye, Users } from "lucide-react";
import { getGalleryStats } from "@/services/galleryService";

export const GalleryStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    totalAuthors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getGalleryStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 text-sm text-gray-500">
        <div className="animate-pulse">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 text-sm">
      {/* Total Projects */}
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-[#667eea]" />
        <span className="text-gray-400">Projects:</span>
        <span className="font-semibold text-white">
          {stats.totalProjects.toLocaleString()}
        </span>
      </div>

      {/* Total Views */}
      <div className="flex items-center gap-2">
        <Eye size={16} className="text-[#667eea]" />
        <span className="text-gray-400">Views:</span>
        <span className="font-semibold text-white">
          {stats.totalViews.toLocaleString()}
        </span>
      </div>

      {/* Total Authors */}
      <div className="flex items-center gap-2">
        <Users size={16} className="text-[#667eea]" />
        <span className="text-gray-400">Creators:</span>
        <span className="font-semibold text-white">
          {stats.totalAuthors.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
