"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useGraphVisibilityStore } from "@/store/graphVisibilityStore";
import { cn } from "@/lib/utils";

export const GraphVisibilityPanel: React.FC = () => {
  const {
    showOriginalSignal,
    showNoisySignal,
    showFilteredSignal,
    showSpectrum,
    showDecomposition,
    showSpectrogram,
    showFrequencyResponse,
    toggleOriginalSignal,
    toggleNoisySignal,
    toggleFilteredSignal,
    toggleSpectrum,
    toggleDecomposition,
    toggleSpectrogram,
    toggleFrequencyResponse,
  } = useGraphVisibilityStore();

  const graphs = [
    {
      label: "Original",
      visible: showOriginalSignal,
      toggle: toggleOriginalSignal,
      color: "text-blue-400",
    },
    {
      label: "Noisy",
      visible: showNoisySignal,
      toggle: toggleNoisySignal,
      color: "text-orange-400",
    },
    {
      label: "Filtered",
      visible: showFilteredSignal,
      toggle: toggleFilteredSignal,
      color: "text-green-400",
    },
    {
      label: "Spectrum",
      visible: showSpectrum,
      toggle: toggleSpectrum,
      color: "text-purple-400",
    },
    {
      label: "Decomp",
      visible: showDecomposition,
      toggle: toggleDecomposition,
      color: "text-cyan-400",
    },
    {
      label: "Spectro",
      visible: showSpectrogram,
      toggle: toggleSpectrogram,
      color: "text-pink-400",
    },
    {
      label: "АЧХ/ФЧХ",
      visible: showFrequencyResponse,
      toggle: toggleFrequencyResponse,
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">Graphs:</span>
      <div className="flex gap-1">
        {graphs.map((graph) => (
          <button
            key={graph.label}
            onClick={graph.toggle}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded transition-all",
              graph.visible
                ? "bg-[#2a2a2a] border border-[#333]"
                : "bg-[#1a1a1a] border border-[#2a2a2a] opacity-50"
            )}
            title={graph.visible ? `Hide ${graph.label}` : `Show ${graph.label}`}
          >
            {graph.visible ? (
              <Eye size={12} className={graph.color} />
            ) : (
              <EyeOff size={12} className="text-gray-500" />
            )}
            <span
              className={cn(
                "font-medium",
                graph.visible ? graph.color : "text-gray-500"
              )}
            >
              {graph.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
