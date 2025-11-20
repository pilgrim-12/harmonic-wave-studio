"use client";

import React from "react";
import { Clock, TrendingUp, Eye } from "lucide-react";
import { GallerySortOption } from "@/services/galleryService";

interface FilterPanelProps {
  sortBy: GallerySortOption;
  onSortChange: (sort: GallerySortOption) => void;
}

const sortOptions: {
  value: GallerySortOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "recent", label: "Recent", icon: <Clock size={14} /> },
  { value: "popular", label: "Popular", icon: <TrendingUp size={14} /> },
  { value: "views", label: "Most Viewed", icon: <Eye size={14} /> },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-2">Sort by:</span>

      <div className="flex gap-2">
        {sortOptions.map((option) => {
          const isActive = sortBy === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#667eea] text-white"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white"
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
