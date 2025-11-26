"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getUserProjects,
  deleteProject,
  Project,
} from "@/services/projectService";
import { useProjectStore } from "@/store/useProjectStore";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Trash2, FolderOpen, ArrowLeft, Share2 } from "lucide-react"; // ✅ ДОБАВЛЕНО Share2
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { setCurrentProject } = useProjectStore();
  const { clearRadii, addRadius, selectRadius } = useRadiusStore();
  const { setActiveTrackingRadius } = useSimulationStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/studio");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    setLoadingProjects(true);
    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleLoadProject = (project: Project) => {
    clearRadii();

    let previousRadiusId: string | null = null;
    let lastRadiusId: string | null = null;

    project.radii.forEach((radius) => {
      const newRadiusId = addRadius({
        parentId: previousRadiusId,
        length: radius.amplitude,
        initialAngle: radius.phase,
        rotationSpeed: Math.abs(radius.frequency),
        direction: radius.frequency >= 0 ? "counterclockwise" : "clockwise",
      });

      previousRadiusId = newRadiusId;
      lastRadiusId = newRadiusId;
    });

    if (lastRadiusId) {
      selectRadius(lastRadiusId);
      setActiveTrackingRadius(lastRadiusId);
    }

    setCurrentProject(project.id!, project.name);
    router.push("/studio");
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      alert("✅ Project deleted!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  // ✅ ДОБАВЛЕНО: Handler для копирования share ссылки
  const handleCopyShareLink = (shareId: string) => {
    const url = `${window.location.origin}/project/${shareId}`;
    navigator.clipboard.writeText(url);
    alert("✅ Share link copied!");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/studio">
            <Button variant="secondary" className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Studio
            </Button>
          </Link>

          <div className="flex items-center gap-6">
            {userProfile?.photoURL && (
              <Image
                src={userProfile.photoURL}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full border-2 border-[#667eea]"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {userProfile?.displayName || "User"}
              </h1>
              <p className="text-gray-400">{userProfile?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {userProfile?.stats.projectsCount || projects.length} projects
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">My Projects</h2>

          {loadingProjects ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No projects yet</p>
              <p className="text-sm mt-2">
                Create your first project in the studio!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between hover:border-[#667eea] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{project.name}</h3>
                      {/* ✅ ДОБАВЛЕНО: Share индикатор */}
                      {project.shareId && (
                        <button
                          onClick={() => handleCopyShareLink(project.shareId!)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors"
                          title="Copy share link"
                        >
                          <Share2 size={12} />
                          Shared
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.radii.length} radii • Updated{" "}
                      {new Date(project.updatedAt!).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleLoadProject(project)}
                      variant="primary"
                      className="text-sm"
                    >
                      <FolderOpen size={14} className="mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.id!)}
                      variant="secondary"
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
