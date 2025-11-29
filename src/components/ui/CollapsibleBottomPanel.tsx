"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, BarChart2 } from "lucide-react";

interface CollapsibleBottomPanelProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const CollapsibleBottomPanel: React.FC<CollapsibleBottomPanelProps> = ({
  children,
  title = "Graphs",
  icon,
  defaultHeight = 200,
  minHeight = 100,
  maxHeight = 400,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate new height based on mouse movement (dragging up increases height)
      const deltaY = startYRef.current - e.clientY;
      const newHeight = startHeightRef.current + deltaY;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    if (isResizing) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minHeight, maxHeight]);

  const handleResizeStart = (e: React.MouseEvent) => {
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    setIsResizing(true);
  };

  if (isCollapsed) {
    return (
      <div className="w-full h-10 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
          title="Expand graphs panel"
        >
          {icon || <BarChart2 size={16} className="text-[#667eea]" />}
          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
            {title}
          </span>
          <ChevronUp
            size={16}
            className="text-gray-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 relative w-full flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Resize handle at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[#667eea]/50 transition-colors z-10 ${
          isResizing ? "bg-[#667eea]" : "bg-transparent"
        }`}
        onMouseDown={handleResizeStart}
        title="Drag to resize"
      />

      {/* Header with title and collapse button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a]/80 border-t border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {icon || <BarChart2 size={14} className="text-[#667eea]" />}
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-[#2a2a2a] rounded transition-colors group"
          title="Collapse graphs panel"
        >
          <ChevronDown
            size={14}
            className="text-gray-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
