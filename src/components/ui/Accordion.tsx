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
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-[#252525] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-[#667eea]">{title}</h2>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-gray-400 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-3 pt-0">{children}</div>
      </div>
    </div>
  );
};
