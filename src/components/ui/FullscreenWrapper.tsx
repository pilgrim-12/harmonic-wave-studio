"use client";

import React, { useState } from "react";
import { X, Maximize2 } from "lucide-react";

interface FullscreenWrapperProps {
  children: React.ReactNode;
}

export const FullscreenWrapper: React.FC<FullscreenWrapperProps> = ({
  children,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDoubleClick = () => {
    setIsFullscreen(true);
  };

  const handleExit = () => {
    setIsFullscreen(false);
  };

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#0f0f0f]"
        onDoubleClick={handleExit}
      >
        {/* Exit button */}
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-50 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg border border-[#2a2a2a] transition-colors flex items-center gap-2 text-gray-400 hover:text-white"
          title="Exit fullscreen (Esc or double-click)"
        >
          <X size={16} />
          <span className="text-sm">Exit Fullscreen</span>
        </button>

        {/* Fullscreen content */}
        <div className="w-full h-full">{children}</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full group"
      onDoubleClick={handleDoubleClick}
      title="Double-click for fullscreen"
    >
      {/* Fullscreen hint - shows on hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="px-2 py-1 bg-[#1a1a1a]/90 rounded text-xs text-gray-400 flex items-center gap-1">
          <Maximize2 size={12} />
          <span>Double-click for fullscreen</span>
        </div>
      </div>

      {children}
    </div>
  );
};
