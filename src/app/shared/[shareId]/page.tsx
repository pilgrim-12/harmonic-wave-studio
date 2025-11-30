"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { SharedProject } from "@/types/share";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Eye, User, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { TrajectoryPreview } from "@/components/gallery/TrajectoryPreview";
import { FormulaDisplay } from "@/components/studio/FormulaDisplay";

export default function SharedProjectPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  const loadProject = async () => {
    try {
      // Get shared project data
      const shareRef = doc(db, "shared-projects", shareId);
      const shareSnap = await getDoc(shareRef);

      if (!shareSnap.exists()) {
        setError("Project not found");
        setLoading(false);
        return;
      }

      const shareData = {
        id: shareSnap.id,
        ...shareSnap.data(),
      } as SharedProject;

      setProject(shareData);

      // Increment view count
      await updateDoc(shareRef, {
        viewCount: increment(1),
      });
    } catch (err) {
      console.error("Error loading shared project:", err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Project Not Found
          </h1>
          <p className="text-gray-400 mb-6">{error || "Project not found"}</p>
          <Link href="/gallery">
            <Button variant="primary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = project.createdAt
    ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-3">
      <div className="max-w-4xl mx-auto">
        {/* Minimal Header */}
        <div className="mb-3 flex items-center justify-between">
          <Link href="/gallery">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={12} className="mr-1" />
              Gallery
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <div className="flex items-center gap-0.5">
              <Eye size={12} />
              <span>{project.viewCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Calendar size={12} />
              <span>{createdDate}</span>
            </div>
          </div>
        </div>

        {/* Title + Tags inline */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white mb-1">
            {project.projectName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <User size={12} />
            <span>{project.userName}</span>
          </div>

          {/* Inline description and tags */}
          <div className="space-y-1.5">
            {project.description && (
              <p className="text-xs text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-[#667eea]/20 text-[#667eea] rounded text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trajectory Preview */}
        <div className="mb-3 h-44 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] overflow-hidden">
          <TrajectoryPreview radii={project.radii} trailLength={800} />
        </div>

        {/* Signal Formula */}
        <div className="mb-3">
          <FormulaDisplay radii={project.radii} />
        </div>

        {/* Ultra Compact Config + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
          {/* Config - smaller */}
          <div className="p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Radii:</span>
                <span className="text-white">{project.radii.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Speed:</span>
                <span className="text-white">
                  {project.settings?.animationSpeed || 1}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trail:</span>
                <span className="text-white">
                  {project.settings?.trailLength || 100}pts
                </span>
              </div>
            </div>
          </div>

          {/* Actions - side by side */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                try {
                  const projectData = {
                    radii: project.radii,
                    settings: {
                      animationSpeed: project.settings?.animationSpeed || 1,
                      trailLength: project.settings?.trailLength || 1000,
                    },
                    metadata: {
                      projectName: project.projectName,
                      userName: project.userName,
                      shareId: project.id,
                    },
                  };
                  const encodedData = btoa(JSON.stringify(projectData));
                  router.push(`/studio?loadShared=${encodedData}`);
                } catch (error) {
                  console.error("Error loading project:", error);
                  alert("Failed to load project into studio");
                }
              }}
              variant="primary"
              className="w-full"
              size="sm"
            >
              Open in Studio
            </Button>
            <Button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Link copied!");
              }}
              variant="secondary"
              className="w-full"
              size="sm"
            >
              Copy Link
            </Button>
          </div>
        </div>

        {/* Minimal Radii Table */}
        <div className="p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-1 text-gray-500">#</th>
                  <th className="text-left py-1 text-gray-500">Color</th>
                  <th className="text-right py-1 text-gray-500">Freq</th>
                  <th className="text-right py-1 text-gray-500">Amp</th>
                  <th className="text-right py-1 text-gray-500">Phase</th>
                </tr>
              </thead>
              <tbody>
                {project.radii.map(
                  (
                    radius: {
                      frequency: number;
                      amplitude: number;
                      phase: number;
                      color?: string;
                    },
                    index: number
                  ) => (
                    <tr key={index} className="border-b border-[#2a2a2a]/50">
                      <td className="py-1 text-gray-400">{index + 1}</td>
                      <td className="py-1">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-600"
                          style={{ backgroundColor: radius.color || '#667eea' }}
                        />
                      </td>
                      <td className="text-right py-1 text-white">
                        {radius.frequency?.toFixed(2)}
                      </td>
                      <td className="text-right py-1 text-white">
                        {radius.amplitude?.toFixed(2)}
                      </td>
                      <td className="text-right py-1 text-white">
                        {radius.phase?.toFixed(2)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
