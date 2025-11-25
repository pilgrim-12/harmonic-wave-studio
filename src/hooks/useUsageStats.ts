"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProjects } from "@/services/projectService";
import { getUserSharedProjectsCount } from "@/services/shareService";
import { useTierCheck } from "./useTierCheck";

export interface UsageStats {
  projects: {
    current: number;
    limit: number;
  };
  shares: {
    current: number;
    limit: number;
  };
  radii: {
    current: number;
    limit: number;
  };
}

export const useUsageStats = (currentRadiiCount: number = 0) => {
  const { user } = useAuth();
  const { features } = useTierCheck();
  const [stats, setStats] = useState<UsageStats>({
    projects: { current: 0, limit: features.maxProjects },
    shares: { current: 0, limit: features.maxShares },
    radii: { current: currentRadiiCount, limit: features.maxRadii },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats({
          projects: { current: 0, limit: features.maxProjects },
          shares: { current: 0, limit: features.maxShares },
          radii: { current: currentRadiiCount, limit: features.maxRadii },
        });
        setLoading(false);
        return;
      }

      try {
        const [projects, sharesCount] = await Promise.all([
          getUserProjects(user.uid),
          getUserSharedProjectsCount(user.uid),
        ]);

        setStats({
          projects: {
            current: projects.length,
            limit: features.maxProjects,
          },
          shares: {
            current: sharesCount,
            limit: features.maxShares,
          },
          radii: {
            current: currentRadiiCount,
            limit: features.maxRadii,
          },
        });
      } catch (error) {
        console.error("Error fetching usage stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, features, currentRadiiCount]);

  return { stats, loading };
};
