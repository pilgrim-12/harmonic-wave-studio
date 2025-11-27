"use client";

import React from "react";
import { SharedProject } from "@/types/share";
import { Eye, User, Calendar, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ProjectCardProps {
  project: SharedProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Load project directly into studio
      loadProjectIntoStudio();
    }
  };

  const loadProjectIntoStudio = () => {
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
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/shared/${project.id}`);
  };

  const createdDate = project.createdAt
    ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
    : "Unknown";

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#1a1a1a] rounded-md border border-[#2a2a2a] overflow-hidden cursor-pointer transition-all hover:border-[#667eea] hover:shadow-lg hover:shadow-[#667eea]/10"
    >
      {/* Compact Preview - thin but visible */}
      <div className="relative h-28 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 flex items-center justify-center border-b border-[#2a2a2a] group-hover:from-[#667eea]/30 group-hover:to-[#764ba2]/30 transition-all">
        {/* Info button - shows on hover */}
        <Button
          onClick={handleDetailsClick}
          variant="secondary"
          className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          title="View details"
        >
          <Info size={12} />
        </Button>
      </div>

      {/* Dense Content */}
      <div className="p-2">
        {/* Title - 2 lines max */}
        <h3 className="text-xs font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#667eea] transition-colors leading-snug h-8">
          {project.projectName}
        </h3>

        {/* Description if exists - 1 line */}
        {project.description && (
          <p className="text-[10px] text-gray-400 mb-1 line-clamp-1 leading-tight">
            {project.description}
          </p>
        )}

        {/* Tags - inline, max 2 */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1.5">
            {project.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1 py-0.5 bg-[#667eea]/20 text-[#667eea] rounded text-[9px] leading-none"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="text-[9px] text-gray-500">
                +{project.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer - all info in one line */}
        <div className="flex items-center gap-2 text-[9px] text-gray-500 pt-1 border-t border-[#2a2a2a]/50">
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            <User size={8} className="flex-shrink-0" />
            <span className="truncate">{project.userName}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-0.5">
              <Eye size={8} />
              <span>{project.viewCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Calendar size={8} />
              <span>
                {createdDate.split("/")[0]}/{createdDate.split("/")[1]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
