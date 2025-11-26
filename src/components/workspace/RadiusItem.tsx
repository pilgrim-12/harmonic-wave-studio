"use client";

import React, { useState } from "react";
import { Trash2, Edit2, Activity, PenLine } from "lucide-react";
import { Radius } from "@/types/radius";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface RadiusItemProps {
  radius: Radius;
  onEdit?: (radius: Radius) => void;
}

export const RadiusItem: React.FC<RadiusItemProps> = ({ radius, onEdit }) => {
  const { selectedRadiusId, selectRadius, removeRadius, updateRadius } =
    useRadiusStore();
  const { activeTrackingRadiusId, setActiveTrackingRadius, trackedRadiusIds, toggleTrailTracking } =
    useSimulationStore();

  const [showColorPicker, setShowColorPicker] = useState(false);

  const isSelected = selectedRadiusId === radius.id;
  const isTracking = activeTrackingRadiusId === radius.id;
  const isTrailTracked = trackedRadiusIds.includes(radius.id);
  const isRoot = radius.parentId === null;

  // ⭐ Auto-expand when selected!
  const isExpanded = isSelected;

  const handleClick = () => {
    selectRadius(radius.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(radius);
  };

  const handleSetTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTrackingRadius(radius.id);
    // Автоматически включаем траекторию при выборе для графика
    if (!isTrailTracked) {
      toggleTrailTracking(radius.id);
    }
  };

  const handleToggleTrail = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrailTracking(radius.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simply delete without confirmation for better UX
    removeRadius(radius.id);
  };

  // Slider handlers
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRadius(radius.id, { length: parseFloat(e.target.value) });
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRadius(radius.id, { rotationSpeed: parseFloat(e.target.value) });
  };

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const degrees = parseFloat(e.target.value);
    const radians = (degrees * Math.PI) / 180;
    updateRadius(radius.id, { initialAngle: radians });
  };

  // Toggle direction
  const handleToggleDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDirection =
      radius.direction === "clockwise" ? "counterclockwise" : "clockwise";
    updateRadius(radius.id, { direction: newDirection });
  };

  // Color picker
  const handleColorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(!showColorPicker);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRadius(radius.id, { color: e.target.value });
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
    "#a8edea",
    "#fed6e3",
    "#c471ed",
    "#f64f59",
  ];

  return (
    <div
      onClick={handleClick}
      className={cn(
        "rounded-lg cursor-pointer transition-all",
        "border-l-4",
        isSelected
          ? "bg-[#2a2a2a] border-l-[#FF9800]"
          : "bg-[#252525] border-l-[#667eea] hover:bg-[#2a2a2a]"
      )}
    >
      {/* Header */}
      <div className="p-2.5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {/* Color dot with picker */}
            <div className="relative">
              <div
                onClick={handleColorClick}
                className="w-3 h-3 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-white/40 transition-all"
                style={{ backgroundColor: radius.color }}
                title="Change color"
              />
              {showColorPicker && (
                <div
                  className="absolute top-6 left-0 z-50 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 shadow-xl w-40"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Color grid */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {commonColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          updateRadius(radius.id, { color });
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded hover:scale-110 transition-transform ring-1 ring-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {/* Custom color picker */}
                  <input
                    type="color"
                    value={radius.color}
                    onChange={handleColorChange}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            <span
              className={cn(
                "font-semibold text-xs",
                isSelected ? "text-[#FF9800]" : "text-[#667eea]"
              )}
            >
              {radius.name}
            </span>
            <div className="flex gap-1">
              {isTrailTracked && <span className="text-xs text-purple-400">✏️</span>}
              {isTracking && <span className="text-xs text-green-500">📊</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-0.5">
            <button
              onClick={handleToggleTrail}
              className={cn(
                "p-1 rounded transition-colors",
                isTrailTracked
                  ? "bg-purple-500/20 text-purple-400"
                  : "hover:bg-[#333] text-gray-400"
              )}
              title={isTrailTracked ? "Hide trail" : "Show trail"}
            >
              <PenLine size={12} />
            </button>
            <button
              onClick={handleSetTracking}
              className={cn(
                "p-1 rounded transition-colors",
                isTracking
                  ? "bg-green-500/20 text-green-400"
                  : "hover:bg-[#333] text-gray-400"
              )}
              title="Track for graph"
            >
              <Activity size={12} />
            </button>
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-[#333] rounded transition-colors"
              title="Edit in modal"
            >
              <Edit2 size={12} className="text-gray-400" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isRoot}
              className={cn(
                "p-1 rounded transition-colors",
                isRoot ? "opacity-30 cursor-not-allowed" : "hover:bg-red-500/20"
              )}
              title={isRoot ? "Cannot delete root" : "Delete"}
            >
              <Trash2 size={12} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Compact view */}
        {!isExpanded && (
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-400">
            <div>
              <span className="text-gray-500">Amp:</span>{" "}
              <span className="text-gray-300">{radius.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Freq:</span>{" "}
              <span className="text-gray-300">
                {radius.rotationSpeed.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Phase:</span>{" "}
              <span className="text-gray-300">
                {Math.round((radius.initialAngle * 180) / Math.PI)}°
              </span>
            </div>
            <div>
              <span className="text-gray-500">Dir:</span>{" "}
              <button
                onClick={handleToggleDirection}
                className="text-gray-300 hover:text-[#667eea] transition-colors text-[10px]"
              >
                {radius.direction === "counterclockwise" ? "⟲ CCW" : "⟳ CW"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded sliders */}
      {isExpanded && (
        <div
          className="px-2.5 pb-2.5 space-y-2 border-t border-[#333] pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Amplitude slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Tooltip
                content={
                  <div className="max-w-xs">
                    <div className="font-semibold mb-0.5">Amplitude</div>
                    <div className="text-[10px] text-gray-300">
                      Height of the wave. In Fourier series: A in A·sin(ωt + φ)
                    </div>
                  </div>
                }
                className="!whitespace-normal !w-48"
              >
                <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600">
                  Amplitude
                </label>
              </Tooltip>
              <span className="text-[10px] font-semibold text-[#667eea]">
                {radius.length}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="1"
              value={radius.length}
              onChange={handleLengthChange}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#667eea]
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Frequency slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Tooltip
                content={
                  <div className="max-w-xs">
                    <div className="font-semibold mb-0.5">Frequency</div>
                    <div className="text-[10px] text-gray-300">
                      Rotation speed (cycles per second). In Fourier series: ω in
                      A·sin(ωt + φ)
                    </div>
                  </div>
                }
                className="!whitespace-normal !w-48"
              >
                <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600">
                  Frequency
                </label>
              </Tooltip>
              <span className="text-[10px] font-semibold text-[#667eea]">
                {radius.rotationSpeed.toFixed(1)} Hz
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={radius.rotationSpeed}
              onChange={handleSpeedChange}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#667eea]
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Phase slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Tooltip
                content={
                  <div className="max-w-xs">
                    <div className="font-semibold mb-0.5">Phase</div>
                    <div className="text-[10px] text-gray-300">
                      Initial rotation angle. In Fourier series: φ in A·sin(ωt +
                      φ)
                    </div>
                  </div>
                }
                className="!whitespace-normal !w-48"
              >
                <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600">
                  Phase
                </label>
              </Tooltip>
              <span className="text-[10px] font-semibold text-[#667eea]">
                {Math.round((radius.initialAngle * 180) / Math.PI)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={Math.round((radius.initialAngle * 180) / Math.PI)}
              onChange={handleAngleChange}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#667eea]
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Direction toggle */}
          <div className="flex items-center justify-between pt-1">
            <Tooltip
              content={
                <div className="max-w-xs">
                  <div className="font-semibold mb-0.5">
                    Rotation Direction
                  </div>
                  <div className="text-[10px] text-gray-300">
                    CW (clockwise) = positive frequency, CCW
                    (counterclockwise) = negative frequency
                  </div>
                </div>
              }
              className="whitespace-normal"
            >
              <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600">
                Direction
              </label>
            </Tooltip>
            <button
              onClick={handleToggleDirection}
              className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#333] rounded text-[10px] text-gray-300 hover:text-[#667eea] transition-colors"
            >
              {radius.direction === "counterclockwise" ? "⟲ CCW" : "⟳ CW"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
