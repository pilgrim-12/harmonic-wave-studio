"use client";

import React from "react";
import { Project, Radius } from "@/services/projectService";
import { X, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RadiiDetailsViewer, projectRadiiToUnified } from "@/components/ui/RadiiDetailsViewer";

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onLoad: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
  onLoad,
}) => {
  const updatedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString()
    : "Unknown";

  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "Unknown";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white line-clamp-1">
              {project.name}
            </h2>
            {project.shareId && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                <Share2 size={12} />
                Shared
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <div>
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Calendar size={12} />
                <span className="text-xs">Created</span>
              </div>
              <p className="text-sm font-semibold text-white">{createdDate}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Calendar size={12} />
                <span className="text-xs">Updated</span>
              </div>
              <p className="text-sm font-semibold text-white">{updatedDate}</p>
            </div>
          </div>

          {/* Radii Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Radii Parameters ({project.radii.length})
            </h3>
            <RadiiDetailsViewer
              radii={projectRadiiToUnified(project.radii)}
              maxHeight="250px"
              showModulation={true}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[#2a2a2a]">
            <Button
              onClick={onLoad}
              variant="primary"
              className="flex-1"
            >
              Load in Studio
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
