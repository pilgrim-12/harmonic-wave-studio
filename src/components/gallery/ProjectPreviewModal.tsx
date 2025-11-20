"use client";

import React from "react";
import { SharedProject } from "@/types/share";
import { X, Eye, Calendar, User, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface ProjectPreviewModalProps {
  project: SharedProject;
  onClose: () => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  project,
  onClose,
}) => {
  const router = useRouter();

  const handleOpenFull = () => {
    router.push(`/project/${project.id}`);
  };

  const createdDate = project.createdAt
    ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white line-clamp-1">
            {project.projectName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview Area */}
          <div className="aspect-video bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 rounded-lg flex items-center justify-center mb-6 border border-[#2a2a2a]">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-[#667eea]/30 flex items-center justify-center">
                <Play size={32} className="text-[#667eea]" />
              </div>
              <p className="text-sm text-gray-500">
                Preview visualization coming soon
              </p>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-6">
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

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <User size={14} />
                <span className="text-xs">Author</span>
              </div>
              <p className="text-sm font-semibold text-white line-clamp-1">
                {project.userName}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <Eye size={14} />
                <span className="text-xs">Views</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {project.viewCount}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <Calendar size={14} />
                <span className="text-xs">Created</span>
              </div>
              <p className="text-sm font-semibold text-white">{createdDate}</p>
            </div>
          </div>

          {/* Project Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Configuration
            </h3>
            <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] text-sm text-gray-400">
              <div className="flex justify-between mb-1">
                <span>Radii:</span>
                <span className="text-white font-medium">
                  {project.radii.length}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Animation Speed:</span>
                <span className="text-white font-medium">
                  {project.settings.animationSpeed}x
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trail Length:</span>
                <span className="text-white font-medium">
                  {project.settings.trailLength} pts
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleOpenFull}
              variant="primary"
              className="flex-1"
            >
              <ExternalLink size={16} className="mr-2" />
              Open Full Page
            </Button>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
