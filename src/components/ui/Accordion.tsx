"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  children,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-[#252525] transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <h2 className="text-sm font-bold text-[#667eea]">{title}</h2>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-400 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      {isOpen && <div className="flex-1 overflow-hidden">{children}</div>}
    </div>
  );
};
