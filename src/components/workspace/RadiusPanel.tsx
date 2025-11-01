"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { RadiusItem } from "./RadiusItem";
import { RadiusEditor } from "./RadiusEditor";
import { Button } from "@/components/ui/Button";
import { Radius } from "@/types/radius";

export const RadiusPanel: React.FC = () => {
  const { radii, addRadius } = useRadiusStore();
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);

  const handleAddRadius = () => {
    // ALWAYS add to the last radius (linear chain only)
    let parentId: string | null = null;

    if (radii.length > 0) {
      // Get the last radius in the list
      parentId = radii[radii.length - 1].id;
    }

    addRadius({
      parentId,
      length: 30,
      initialAngle: 0,
      rotationSpeed: 1,
      direction: "counterclockwise",
    });
  };

  const handleEdit = (radius: Radius) => {
    setEditingRadius(radius);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#667eea]">
        <h2 className="text-base font-bold text-[#667eea] flex items-center gap-2">
          ⚙️ Radii
        </h2>
        <span className="text-xs text-gray-500">
          {radii.length} {radii.length === 1 ? "radius" : "radii"}
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {radii.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-xs">No radii</p>
            <p className="text-xs mt-1">
              Click the button below to add the first one
            </p>
          </div>
        ) : (
          radii.map((radius) => (
            <RadiusItem key={radius.id} radius={radius} onEdit={handleEdit} />
          ))
        )}
      </div>

      {/* Add button */}
      <Button
        onClick={handleAddRadius}
        variant="secondary"
        className="w-full text-sm"
      >
        <Plus size={14} className="mr-1" />
        Add Radius
      </Button>

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
