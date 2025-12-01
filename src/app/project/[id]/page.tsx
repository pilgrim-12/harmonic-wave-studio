"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Calendar,
  Eye,
  Play,
  FolderOpen,
  FunctionSquare,
} from "lucide-react";
import { getSharedProject, incrementViewCount } from "@/services/shareService";
import { SharedProject } from "@/types/share";
import { Button } from "@/components/ui/Button";
import { useRadiusStore } from "@/store/radiusStore";
import { TrajectoryPreview } from "@/components/gallery/TrajectoryPreview";
import { FormulaDisplay } from "@/components/studio/FormulaDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { RadiiDetailsViewer, projectRadiiToUnified } from "@/components/ui/RadiiDetailsViewer";
import Link from "next/link";

export default function SharedProjectPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;

  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { clearRadii, addRadius } = useRadiusStore();
  const { user } = useAuth();

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSharedProject(shareId);

      if (!data) {
        setError("Project not found");
        return;
      }

      setProject(data);

      // Increment view count
      await incrementViewCount(shareId);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToStudio = () => {
    router.push("/studio");
  };

  // ✅ ДОБАВЛЕНО: Open in Studio
  const handleOpenInStudio = () => {
    if (!project) return;

    // Очищаем текущие radii
    clearRadii();

    // Конвертируем radii из Firebase формата в store формат
    let parentId: string | null = null;

    project.radii.forEach((radius, index) => {
      const newRadiusId = addRadius({
        parentId: parentId,
        length: radius.amplitude,
        initialAngle: radius.phase,
        rotationSpeed: Math.abs(radius.frequency),
        direction: radius.frequency >= 0 ? "counterclockwise" : "clockwise",
        name: `Radius ${index + 1}`,
        color: radius.color, // Restore saved color
      });

      // Следующий радиус будет child текущего
      parentId = newRadiusId;
    });

    // Переходим в студию
    router.push("/studio");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Project Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error || "This project doesn't exist or has been removed."}
          </p>
          <Button onClick={handleGoToStudio}>
            <ArrowLeft size={16} />
            Go to Studio
          </Button>
        </div>
      </div>
    );
  }

  const createdDate = project.createdAt
    ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6">
          <Button onClick={handleGoToStudio} variant="secondary">
            <ArrowLeft size={16} />
            Back to Studio
          </Button>
          {user && (
            <Link href="/profile">
              <Button variant="secondary">
                <FolderOpen size={16} />
                My Projects
              </Button>
            </Link>
          )}
        </div>

        {/* Project Info Card */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {project.projectName}
              </h1>
              {project.description && (
                <p className="text-gray-400 text-lg">{project.description}</p>
              )}
            </div>

            {/* ✅ ДОБАВЛЕНО: Open in Studio Button */}
            <Button onClick={handleOpenInStudio} className="ml-4">
              <Play size={16} />
              Open in Studio
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>by {project.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{createdDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{project.viewCount} views</span>
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#667eea]/20 text-[#667eea] rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} />
                Link Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Share Link
              </>
            )}
          </button>
        </div>

        {/* Trajectory Preview */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 mb-6">
          <div className="h-64 bg-[#0a0a0a] rounded-lg overflow-hidden">
            <TrajectoryPreview radii={project.radii} trailLength={800} />
          </div>
        </div>

        {/* Signal Formula */}
        <div className="mb-6">
          <FormulaDisplay radii={project.radii} />
        </div>

        {/* Project Data */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Project Configuration
          </h2>

          {/* Radii */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Radii ({project.radii.length})
            </h3>
            <RadiiDetailsViewer
              radii={projectRadiiToUnified(project.radii)}
              maxHeight="250px"
              showModulation={true}
            />
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Settings</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[#0f0f0f] rounded-lg">
                <span className="text-gray-500">Animation Speed:</span>
                <span className="text-white ml-2">
                  {project.settings.animationSpeed}x
                </span>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-lg">
                <span className="text-gray-500">Trail Length:</span>
                <span className="text-white ml-2">
                  {project.settings.trailLength}
                </span>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-lg">
                <span className="text-gray-500">Grid Size:</span>
                <span className="text-white ml-2">
                  {project.settings.gridSize}px
                </span>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-lg">
                <span className="text-gray-500">Zoom:</span>
                <span className="text-white ml-2">
                  {project.settings.zoom}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clone Button - Coming Soon */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Clone to My Projects coming soon! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
