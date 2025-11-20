"use client";

import React from "react";
import { SharedProject } from "@/types/share";
import { Eye, User, Calendar, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: SharedProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Use shareId for shared projects in gallery
      router.push(`/shared/${project.id}`);
    }
  };

  const createdDate = project.createdAt
    ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div
      onClick={handleClick}
      className="group bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden cursor-pointer transition-all hover:border-[#667eea] hover:shadow-lg hover:shadow-[#667eea]/10"
    >
      {/* Preview Area - Placeholder for now */}
      <div className="aspect-video bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 flex items-center justify-center border-b border-[#2a2a2a] group-hover:from-[#667eea]/30 group-hover:to-[#764ba2]/30 transition-all">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-[#667eea]/30 flex items-center justify-center">
            <Play size={24} className="text-[#667eea]" />
          </div>
          <p className="text-xs text-gray-500">Click to preview</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-1 group-hover:text-[#667eea] transition-colors">
          {project.projectName}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-[#667eea]/20 text-[#667eea] rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-[#2a2a2a] text-gray-500 rounded text-xs">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Author */}
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="line-clamp-1">{project.userName}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{project.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{createdDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
