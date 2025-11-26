"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Show tooltip on top if there's more space above, otherwise below
      setPosition(spaceAbove > spaceBelow ? "top" : "bottom");
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1.5 text-xs text-white bg-[#1a1a1a] border border-[#444] rounded shadow-lg",
            "whitespace-nowrap pointer-events-none",
            position === "top"
              ? "bottom-full left-0 mb-1"
              : "top-full left-0 mt-1",
            className
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] border-[#444] rotate-45",
              position === "top"
                ? "top-full -mt-1 border-r border-b"
                : "bottom-full -mb-1 border-l border-t"
            )}
          />
        </div>
      )}
    </div>
  );
};
