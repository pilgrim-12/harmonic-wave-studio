"use client";

import React, { useState } from "react";
import { Trash2, Edit2, Activity } from "lucide-react";
import { Radius } from "@/types/radius";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { cn } from "@/lib/utils";

interface RadiusItemProps {
  radius: Radius;
  onEdit?: (radius: Radius) => void;
}

export const RadiusItem: React.FC<RadiusItemProps> = ({ radius, onEdit }) => {
  const { selectedRadiusId, selectRadius, removeRadius, updateRadius } =
    useRadiusStore();
  const { activeTrackingRadiusId, setActiveTrackingRadius } =
    useSimulationStore();

  const [isEditingSpeed, setIsEditingSpeed] = useState(false);
  const [speedValue, setSpeedValue] = useState(radius.rotationSpeed.toString());

  const isSelected = selectedRadiusId === radius.id;
  const isTracking = activeTrackingRadiusId === radius.id;
  const isRoot = radius.parentId === null;

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
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      isRoot &&
      confirm("Удалить корневой радиус? Это удалит все дочерние радиусы.")
    ) {
      removeRadius(radius.id);
    } else if (!isRoot) {
      removeRadius(radius.id);
    }
  };

  // Быстрое редактирование скорости
  const handleSpeedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingSpeed(true);
    setSpeedValue(radius.rotationSpeed.toString());
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeedValue(e.target.value);
  };

  const handleSpeedBlur = () => {
    const newSpeed = parseFloat(speedValue);
    if (!isNaN(newSpeed)) {
      updateRadius(radius.id, { rotationSpeed: newSpeed });
    }
    setIsEditingSpeed(false);
  };

  const handleSpeedKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSpeedBlur();
    } else if (e.key === "Escape") {
      setIsEditingSpeed(false);
      setSpeedValue(radius.rotationSpeed.toString());
    }
  };

  // Быстрое переключение направления
  const handleToggleDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDirection =
      radius.direction === "clockwise" ? "counterclockwise" : "clockwise";
    updateRadius(radius.id, { direction: newDirection });
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-all",
        "border-l-4",
        isSelected
          ? "bg-[#2a2a2a] border-l-[#FF9800]"
          : "bg-[#252525] border-l-[#667eea] hover:bg-[#2a2a2a]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: radius.color }}
          />
          <span
            className={cn(
              "font-semibold text-sm",
              isSelected ? "text-[#FF9800]" : "text-[#667eea]"
            )}
          >
            {radius.name}
          </span>
          {isTracking && <span className="text-xs text-green-500">📊</span>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleSetTracking}
            className={cn(
              "p-1 rounded transition-colors",
              isTracking
                ? "bg-green-500/20 text-green-400"
                : "hover:bg-[#333] text-gray-400"
            )}
            title="Отслеживать для графика"
          >
            <Activity size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title="Редактировать"
          >
            <Edit2 size={14} className="text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isRoot}
            className={cn(
              "p-1 rounded transition-colors",
              isRoot ? "opacity-30 cursor-not-allowed" : "hover:bg-red-500/20"
            )}
            title={isRoot ? "Нельзя удалить корневой" : "Удалить"}
          >
            <Trash2 size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
        <div>
          <span className="text-gray-500">Длина:</span>{" "}
          <span className="text-gray-300">{radius.length}px</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Скорость:</span>{" "}
          {isEditingSpeed ? (
            <input
              type="number"
              value={speedValue}
              onChange={handleSpeedChange}
              onBlur={handleSpeedBlur}
              onKeyDown={handleSpeedKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-12 px-1 bg-[#333] text-gray-300 rounded border border-[#667eea] focus:outline-none"
              autoFocus
              step="0.1"
            />
          ) : (
            <span
              onClick={handleSpeedClick}
              className="text-gray-300 cursor-pointer hover:text-[#667eea] underline decoration-dotted"
            >
              {radius.rotationSpeed.toFixed(1)}
            </span>
          )}
        </div>
        <div>
          <span className="text-gray-500">Угол:</span>{" "}
          <span className="text-gray-300">
            {Math.round((radius.initialAngle * 180) / Math.PI)}°
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Направление:</span>{" "}
          <button
            onClick={handleToggleDirection}
            className="text-gray-300 hover:text-[#667eea] transition-colors"
            title="Переключить направление"
          >
            {radius.direction === "counterclockwise" ? "⟲ CCW" : "⟳ CW"}
          </button>
        </div>
      </div>
    </div>
  );
};
