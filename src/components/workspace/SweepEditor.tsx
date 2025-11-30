"use client";

import React, { useMemo } from "react";
import {
  SweepConfig,
  SweepPreset,
  DEFAULT_SWEEP,
  SWEEP_PRESETS
} from "@/types/radius";
import { Tooltip } from "@/components/ui/Tooltip";
import { TrendingUp } from "lucide-react";

interface SweepEditorProps {
  sweep?: SweepConfig;
  onChange: (sweep: SweepConfig) => void;
}

export const SweepEditor: React.FC<SweepEditorProps> = ({
  sweep,
  onChange,
}) => {
  const currentSweep = sweep || DEFAULT_SWEEP;

  const handleToggleEnabled = () => {
    onChange({
      ...currentSweep,
      enabled: !currentSweep.enabled,
    });
  };

  const handlePresetChange = (preset: SweepPreset) => {
    if (preset === "none") {
      onChange({ ...currentSweep, enabled: false });
    } else if (preset === "custom") {
      onChange({ ...currentSweep, enabled: true });
    } else {
      const presetConfig = SWEEP_PRESETS[preset];
      onChange({
        ...DEFAULT_SWEEP,
        ...presetConfig,
        enabled: true,
      });
    }
  };

  const handleParamChange = (param: keyof SweepConfig, value: number | boolean) => {
    onChange({
      ...currentSweep,
      [param]: value,
    });
  };

  // Generate SVG path for sweep visualization
  const sweepPath = useMemo(() => {
    const { startFreq, endFreq, duration } = currentSweep;
    const width = 100;
    const height = 30;
    const padding = 2;

    // Normalize frequencies to [0, 1] range for display
    const maxFreq = Math.max(startFreq, endFreq, 1);
    const minFreq = Math.min(startFreq, endFreq, 0);
    const range = maxFreq - minFreq || 1;

    const startY = height - padding - ((startFreq - minFreq) / range) * (height - 2 * padding);
    const endY = height - padding - ((endFreq - minFreq) / range) * (height - 2 * padding);

    return `M ${padding} ${startY} L ${width - padding} ${endY}`;
  }, [currentSweep]);

  // Arrow direction indicator
  const isRising = currentSweep.endFreq > currentSweep.startFreq;

  return (
    <div className="space-y-2 pt-1">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Tooltip
          content={
            <div className="max-w-xs">
              <div className="font-semibold mb-0.5">Frequency Sweep</div>
              <div className="text-[10px] text-gray-300">
                Linear frequency change over time.
                F1 → F2 over duration T.
              </div>
            </div>
          }
          className="!whitespace-normal !w-48"
        >
          <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600 flex items-center gap-1">
            <TrendingUp size={10} />
            Sweep
          </label>
        </Tooltip>
        <button
          onClick={handleToggleEnabled}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            currentSweep.enabled
              ? "bg-blue-500/20 text-blue-400"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
          }`}
        >
          {currentSweep.enabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Sweep visualization and controls */}
      {currentSweep.enabled && (
        <>
          <div className="bg-[#0a0a0a] rounded p-1.5 border border-[#333]">
            <svg
              viewBox="0 0 100 30"
              className="w-full h-8"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line x1="0" y1="15" x2="100" y2="15" stroke="#333" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Sweep line */}
              <path
                d={sweepPath}
                fill="none"
                stroke="#4facfe"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Start point */}
              <circle
                cx="2"
                cy={30 - 2 - (currentSweep.startFreq / Math.max(currentSweep.startFreq, currentSweep.endFreq, 1)) * 26}
                r="3"
                fill="#667eea"
              />

              {/* End point */}
              <circle
                cx="98"
                cy={30 - 2 - (currentSweep.endFreq / Math.max(currentSweep.startFreq, currentSweep.endFreq, 1)) * 26}
                r="3"
                fill="#f093fb"
              />
            </svg>

            {/* Labels */}
            <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
              <span>{currentSweep.startFreq.toFixed(1)} Hz</span>
              <span className="text-gray-400">{isRising ? "↗" : "↘"}</span>
              <span>{currentSweep.endFreq.toFixed(1)} Hz</span>
            </div>
          </div>

          {/* Preset selector */}
          <div className="flex gap-1 flex-wrap">
            {(["slow-rise", "fast-rise", "slow-fall", "fast-fall"] as SweepPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className="px-1.5 py-0.5 bg-[#1a1a1a] hover:bg-[#333] rounded text-[9px] text-gray-400 hover:text-white transition-colors capitalize"
              >
                {preset.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Sweep parameters */}
          <div className="space-y-2">
            {/* Start Frequency */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Start Freq</span>
                <span className="text-[9px] text-[#667eea]">{currentSweep.startFreq.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={currentSweep.startFreq}
                onChange={(e) => handleParamChange("startFreq", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* End Frequency */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">End Freq</span>
                <span className="text-[9px] text-[#f093fb]">{currentSweep.endFreq.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={currentSweep.endFreq}
                onChange={(e) => handleParamChange("endFreq", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#f093fb] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Duration</span>
                <span className="text-[9px] text-[#4facfe]">{currentSweep.duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={currentSweep.duration}
                onChange={(e) => handleParamChange("duration", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#4facfe] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          {/* Loop toggle */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleParamChange("loop", !currentSweep.loop)}
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                currentSweep.loop
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
              }`}
            >
              {currentSweep.loop ? "↻ Loop" : "→ Once"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
