"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useGraphVisibilityStore } from "@/store/graphVisibilityStore";
import { cn } from "@/lib/utils";

export const GraphVisibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    showOriginalSignal,
    showNoisySignal,
    showFilteredSignal,
    showSpectrum,
    showDecomposition,
    showSpectrogram,
    toggleOriginalSignal,
    toggleNoisySignal,
    toggleFilteredSignal,
    toggleSpectrum,
    toggleDecomposition,
    toggleSpectrogram,
  } = useGraphVisibilityStore();

  const graphs = [
    { label: "Original Signal", visible: showOriginalSignal, toggle: toggleOriginalSignal, color: "text-blue-400", dot: "bg-blue-400" },
    { label: "Noisy Signal", visible: showNoisySignal, toggle: toggleNoisySignal, color: "text-orange-400", dot: "bg-orange-400" },
    { label: "Filtered Signal", visible: showFilteredSignal, toggle: toggleFilteredSignal, color: "text-green-400", dot: "bg-green-400" },
    { label: "Spectrum", visible: showSpectrum, toggle: toggleSpectrum, color: "text-purple-400", dot: "bg-purple-400" },
    { label: "Decomposition", visible: showDecomposition, toggle: toggleDecomposition, color: "text-cyan-400", dot: "bg-cyan-400" },
    { label: "Spectrogram", visible: showSpectrogram, toggle: toggleSpectrogram, color: "text-pink-400", dot: "bg-pink-400" },
  ];

  const visibleCount = graphs.filter((g) => g.visible).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
          "bg-[#252525] border border-[#333] hover:bg-[#2a2a2a] text-gray-300"
        )}
      >
        <Eye size={14} />
        <span>Graphs</span>
        <span className="px-1.5 py-0.5 rounded bg-[#333] text-[10px] text-gray-400 font-bold">
          {visibleCount}/{graphs.length}
        </span>
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1.5 z-30 w-52 shadow-xl shadow-black/40">
          {graphs.map((graph) => (
            <button
              key={graph.label}
              onClick={graph.toggle}
              className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-[#252525] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", graph.visible ? graph.dot : "bg-gray-600")} />
                <span className={cn("text-xs font-medium", graph.visible ? graph.color : "text-gray-500")}>
                  {graph.label}
                </span>
              </div>
              {graph.visible ? (
                <Eye size={14} className={graph.color} />
              ) : (
                <EyeOff size={14} className="text-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
