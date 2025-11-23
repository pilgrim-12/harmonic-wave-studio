"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  children,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex items-start justify-center pt-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
          title="Expand sidebar"
        >
          <ChevronRight
            size={20}
            className="text-gray-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] flex flex-col gap-3 flex-shrink-0 overflow-hidden relative">
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute top-2 right-2 z-10 p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
        title="Collapse sidebar"
      >
        <ChevronLeft
          size={16}
          className="text-gray-400 group-hover:text-white transition-colors"
        />
      </button>

      {/* Sidebar content */}
      {children}
    </div>
  );
};
