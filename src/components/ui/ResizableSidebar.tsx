"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-collapse on small screens
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    if (isResizing) {
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

  // Close overlay sidebar when clicking outside on mobile
  const handleOverlayClick = useCallback(() => {
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

  if (isCollapsed) {
    return (
      <div className="w-10 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex items-start justify-center pt-3 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
          title="Expand sidebar"
        >
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>
    );
  }

  // On mobile: overlay mode
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
        />
        {/* Sidebar as overlay */}
        <div
          ref={sidebarRef}
          className="fixed left-0 top-0 h-full z-50 flex flex-col bg-[#1a1a1a] border-r border-[#2a2a2a] shadow-2xl"
          style={{ width: `${Math.min(width, 300)}px` }}
        >
          <div className="flex justify-end pr-1 pt-1 mb-1 flex-shrink-0">
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 bg-[#2a2a2a] hover:bg-[#333] rounded transition-colors group"
              title="Close sidebar"
            >
              <ChevronLeft
                size={16}
                className="text-gray-400 group-hover:text-white transition-colors"
              />
            </button>
          </div>
          <div className="flex flex-col gap-3 overflow-hidden pr-1 flex-1">
            {children}
          </div>
        </div>
      </>
    );
  }

  // Desktop: inline resizable
  return (
    <div
      ref={sidebarRef}
      className="flex-shrink-0 relative h-full flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="flex justify-end pr-1 mb-1 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 bg-[#2a2a2a] hover:bg-[#333] rounded transition-colors group"
          title="Collapse sidebar"
        >
          <ChevronLeft
            size={16}
            className="text-gray-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-hidden pr-1 flex-1">
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
