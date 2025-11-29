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
import { Trash2, FolderOpen, ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
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
        color: radius.color, // Restore saved color
      });

      previousRadiusId = newRadiusId;
      lastRadiusId = newRadiusId;
    });

    if (lastRadiusId) {
      const radiusIdToSelect = lastRadiusId;
      requestAnimationFrame(() => {
        selectRadius(radiusIdToSelect);
        useSimulationStore.getState().setActiveTrackingRadius(radiusIdToSelect);
        useSimulationStore.getState().toggleTrailTracking(radiusIdToSelect);
      });
    }

    setCurrentProject(project.id!, project.name);
    router.push("/studio");
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete);
      setProjects(projects.filter((p) => p.id !== projectToDelete));
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setProjectToDelete(null);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleViewSharedProject = (shareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/shared/share_${shareId}`);
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
                  onClick={() => handleLoadProject(project)}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between hover:border-[#667eea] transition-colors cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium group-hover:text-[#667eea] transition-colors">
                        {project.name}
                      </h3>
                      {project.shareId && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                          <Share2 size={12} />
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.radii.length} radii • Updated{" "}
                      {new Date(project.updatedAt!).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {project.shareId && (
                      <Button
                        onClick={(e) => handleViewSharedProject(project.shareId!, e)}
                        variant="secondary"
                        className="text-sm"
                        title="View shared project page"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(project.id!);
                      }}
                      variant="secondary"
                      className="text-sm text-red-400 hover:text-red-300"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
          }}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
