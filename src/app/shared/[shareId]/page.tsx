"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { SharedProject } from "@/types/share";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Eye, User, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/gallery">
            <Button variant="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Gallery
            </Button>
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{project.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{createdDate}</span>
            </div>
          </div>
        </div>

        {/* Project Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {project.projectName}
          </h1>
          <div className="flex items-center gap-2 text-gray-400">
            <User size={16} />
            <span>by {project.userName}</span>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Description
            </h3>
            <p className="text-gray-300">{project.description}</p>
          </div>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#667eea]/20 text-[#667eea] rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="mb-6 aspect-video bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 rounded-lg flex items-center justify-center border border-[#2a2a2a]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#667eea]/30 flex items-center justify-center">
              <ExternalLink size={40} className="text-[#667eea]" />
            </div>
            <p className="text-gray-400 mb-2">
              Interactive preview coming soon
            </p>
            <p className="text-sm text-gray-500">
              Canvas visualization will be displayed here
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Configuration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Radii:</span>
                <span className="text-white font-medium">
                  {project.radii.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Animation Speed:</span>
                <span className="text-white font-medium">
                  {project.settings?.animationSpeed || 1}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trail Length:</span>
                <span className="text-white font-medium">
                  {project.settings?.trailLength || 100} pts
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  try {
                    // Prepare project data for studio
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

                    // Encode to base64 for URL
                    const encodedData = btoa(JSON.stringify(projectData));

                    // Navigate to studio with data
                    router.push(`/?loadShared=${encodedData}`);
                  } catch (error) {
                    console.error("Error loading project:", error);
                    alert("Failed to load project into studio");
                  }
                }}
                variant="primary"
                className="w-full"
              >
                Open in Studio
              </Button>
              <Button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("Link copied to clipboard!");
                }}
                variant="secondary"
                className="w-full"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        {/* Radii Details */}
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Radii Configuration
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-2 text-gray-500">#</th>
                  <th className="text-right py-2 text-gray-500">Frequency</th>
                  <th className="text-right py-2 text-gray-500">Amplitude</th>
                  <th className="text-right py-2 text-gray-500">Phase</th>
                </tr>
              </thead>
              <tbody>
                {project.radii.map(
                  (
                    radius: {
                      frequency: number;
                      amplitude: number;
                      phase: number;
                    },
                    index: number
                  ) => (
                    <tr key={index} className="border-b border-[#2a2a2a]/50">
                      <td className="py-2 text-gray-400">{index + 1}</td>
                      <td className="text-right py-2 text-white">
                        {radius.frequency?.toFixed(2)}
                      </td>
                      <td className="text-right py-2 text-white">
                        {radius.amplitude?.toFixed(2)}
                      </td>
                      <td className="text-right py-2 text-white">
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
