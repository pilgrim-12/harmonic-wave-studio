"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { RadiusItem } from "./RadiusItem";
import { RadiusEditor } from "./RadiusEditor";
import { Button } from "@/components/ui/Button";
import { Radius } from "@/types/radius";

export const RadiusPanel: React.FC = () => {
  const { radii, addRadius, selectedRadiusId } = useRadiusStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);

  const handleAddRadius = () => {
    // Автоматическая цепочка: новый радиус прикрепляется к последнему
    let parentId: string | null = null;

    if (radii.length > 0) {
      // Если есть выбранный радиус - к нему, иначе к последнему в списке
      parentId = selectedRadiusId || radii[radii.length - 1].id;
    }

    addRadius({
      parentId,
      length: 100,
      initialAngle: 0,
      rotationSpeed: 1,
      direction: "counterclockwise",
    });
  };

  const handleEdit = (radius: Radius) => {
    setEditingRadius(radius);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#667eea]">
        <h2 className="text-lg font-bold text-[#667eea] flex items-center gap-2">
          ⚙️ Радиусы
        </h2>
        <span className="text-sm text-gray-500">
          {radii.length} {radii.length === 1 ? "радиус" : "радиусов"}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {radii.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Нет радиусов</p>
            <p className="text-xs mt-2">
              Нажмите кнопку ниже чтобы добавить первый
            </p>
          </div>
        ) : (
          radii.map((radius) => (
            <RadiusItem key={radius.id} radius={radius} onEdit={handleEdit} />
          ))
        )}
      </div>

      {/* Add button */}
      <Button onClick={handleAddRadius} variant="secondary" className="w-full">
        <Plus size={16} className="mr-2" />
        Добавить радиус
      </Button>

      {/* Info */}
      {selectedRadiusId && radii.length > 0 && (
        <div className="mt-3 p-3 bg-[#252525] rounded-lg border-l-4 border-[#667eea]">
          <p className="text-xs text-gray-400">
            💡 Новый радиус будет добавлен к выбранному радиусу
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {editingRadius && (
        <RadiusEditor
          radius={editingRadius}
          onClose={() => setEditingRadius(null)}
        />
      )}
    </div>
  );
};
