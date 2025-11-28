"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResizableSidebarProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  title,
  icon,
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 400,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Re-enable text selection
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    if (isResizing) {
      // Disable text selection while resizing
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex items-start justify-center pt-3 flex-shrink-0">
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
    <div
      ref={sidebarRef}
      className="flex-shrink-0 relative h-full flex flex-col"
      style={{ width: `${width}px` }}
    >
      {/* Header with title and collapse button */}
      {title && (
        <div className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <h2 className="text-base font-bold text-[#667eea] truncate">{title}</h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
            title="Collapse sidebar"
          >
            <ChevronLeft
              size={16}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-3 overflow-hidden pr-1 flex-1 mt-3">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#667eea]/50 transition-colors ${
          isResizing ? "bg-[#667eea]" : "bg-transparent"
        }`}
        onMouseDown={() => setIsResizing(true)}
        title="Drag to resize"
      />
    </div>
  );
};
