"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

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
      className="relative h-full w-full"
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </div>
  );
};
