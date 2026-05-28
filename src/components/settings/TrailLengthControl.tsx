"use client";

import React, { useEffect } from "react";
import { PenLine } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

export const TrailLengthControl: React.FC = () => {
  const { settings, updateSettings } = useSimulationStore();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("trailLength");
    if (saved) {
      const trailLength = parseInt(saved, 10);
      if (!isNaN(trailLength) && trailLength >= 50 && trailLength <= 4000) {
        updateSettings({ trailLength });
      }
    }
  }, [updateSettings]);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("trailLength", settings.trailLength.toString());
  }, [settings.trailLength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    updateSettings({ trailLength: value });
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <PenLine size={14} className="text-gray-400 flex-shrink-0" />
      <span className="text-[10px] text-gray-500 whitespace-nowrap hidden lg:inline">
        Trail
      </span>

      <input
        type="range"
        min={50}
        max={4000}
        step={50}
        value={settings.trailLength}
        onChange={handleChange}
        className="flex-1 h-1.5 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#667eea] min-w-[60px]"
        style={{
          background: `linear-gradient(to right, #667eea 0%, #667eea ${
            ((settings.trailLength - 50) / (4000 - 50)) * 100
          }%, #252525 ${
            ((settings.trailLength - 50) / (4000 - 50)) * 100
          }%, #252525 100%)`,
        }}
      />

      <input
        type="number"
        min={50}
        max={4000}
        step={50}
        value={settings.trailLength}
        onChange={handleChange}
        className="w-14 px-1 py-0.5 text-[10px] bg-[#252525] border border-[#2a2a2a] rounded text-[#667eea] font-semibold text-center focus:outline-none focus:border-[#667eea]"
      />
    </div>
  );
};
