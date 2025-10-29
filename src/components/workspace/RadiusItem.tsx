"use client";

import React from "react";
import { Trash2, Edit2 } from "lucide-react";
import { Radius } from "@/types/radius";
import { useRadiusStore } from "@/store/radiusStore";
import { cn } from "@/lib/utils";

interface RadiusItemProps {
  radius: Radius;
  onEdit?: (radius: Radius) => void;
}

export const RadiusItem: React.FC<RadiusItemProps> = ({ radius, onEdit }) => {
  const { selectedRadiusId, selectRadius, removeRadius } = useRadiusStore();
  const isSelected = selectedRadiusId === radius.id;
  const isRoot = radius.parentId === null;

  const handleClick = () => {
    selectRadius(radius.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(radius);
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
          {isRoot && <span className="text-xs text-gray-500">(Корневой)</span>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1">
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
        <div>
          <span className="text-gray-500">Скорость:</span>{" "}
          <span className="text-gray-300">
            {radius.rotationSpeed.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Угол:</span>{" "}
          <span className="text-gray-300">
            {Math.round((radius.initialAngle * 180) / Math.PI)}°
          </span>
        </div>
        <div>
          <span className="text-gray-500">Направление:</span>{" "}
          <span className="text-gray-300">
            {radius.direction === "counterclockwise" ? "⟲ CCW" : "⟳ CW"}
          </span>
        </div>
      </div>
    </div>
  );
};
