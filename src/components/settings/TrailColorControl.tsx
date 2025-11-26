"use client";

import React, { useEffect } from "react";
import { Palette } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

export const TrailColorControl: React.FC = () => {
  const { settings, updateSettings } = useSimulationStore();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("trailColor");
    if (saved) {
      updateSettings({ trailColor: saved });
    }
  }, [updateSettings]);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("trailColor", settings.trailColor);
  }, [settings.trailColor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ trailColor: e.target.value });
  };

  const commonColors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#43e97b",
    "#fa709a",
    "#fee140",
    "#30cfd0",
    "#ffffff",
    "#ff6b6b",
    "#ffd93d",
    "#6bcf7f",
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[100px]">
        <Palette size={16} className="text-gray-400" />
        <span className="text-xs text-gray-300 whitespace-nowrap">
          Trail Color
        </span>
      </div>

      <div className="flex-1 flex items-center gap-2">
        {/* Quick color presets */}
        <div className="flex gap-1.5">
          {commonColors.map((color) => (
            <button
              key={color}
              onClick={() => updateSettings({ trailColor: color })}
              className={`w-6 h-6 rounded hover:scale-110 transition-transform ring-1 ${
                settings.trailColor === color
                  ? "ring-2 ring-white"
                  : "ring-white/20"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <input
          type="color"
          value={settings.trailColor}
          onChange={handleChange}
          className="w-10 h-6 rounded cursor-pointer bg-[#252525] border border-[#2a2a2a]"
          title="Custom color"
        />
      </div>
    </div>
  );
};
