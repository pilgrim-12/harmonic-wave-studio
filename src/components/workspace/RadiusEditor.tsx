"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Radius, UpdateRadiusParams } from "@/types/radius";
import { useRadiusStore } from "@/store/radiusStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";

interface RadiusEditorProps {
  radius: Radius;
  onClose: () => void;
}

export const RadiusEditor: React.FC<RadiusEditorProps> = ({
  radius,
  onClose,
}) => {
  const { updateRadius } = useRadiusStore();

  const [formData, setFormData] = useState({
    name: radius.name,
    length: radius.length,
    initialAngle: Math.round((radius.initialAngle * 180) / Math.PI), // In degrees
    rotationSpeed: radius.rotationSpeed,
    direction: radius.direction,
    color: radius.color,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: UpdateRadiusParams = {
      name: formData.name,
      length: formData.length,
      initialAngle: (formData.initialAngle * Math.PI) / 180, // To radians
      rotationSpeed: formData.rotationSpeed,
      direction: formData.direction,
      color: formData.color,
    };

    updateRadius(radius.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#667eea]">Edit Radius</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Length */}
          <Slider
            label="Length (px)"
            min={10}
            max={200}
            value={formData.length}
            onChange={(e) =>
              setFormData({ ...formData, length: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v}px`}
          />

          {/* Initial Angle */}
          <Slider
            label="Initial Angle (°)"
            min={0}
            max={360}
            value={formData.initialAngle}
            onChange={(e) =>
              setFormData({ ...formData, initialAngle: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v}°`}
          />

          {/* Rotation Speed */}
          <Slider
            label="Rotation Speed (rev/s)"
            min={-10}
            max={10}
            step={0.1}
            value={formData.rotationSpeed}
            onChange={(e) =>
              setFormData({
                ...formData,
                rotationSpeed: Number(e.target.value),
              })
            }
            valueFormatter={(v) => v.toFixed(1)}
          />

          {/* Direction */}
          <Select
            label="Direction"
            value={formData.direction}
            onChange={(e) =>
              setFormData({
                ...formData,
                direction: e.target.value as "clockwise" | "counterclockwise",
              })
            }
            options={[
              { value: "counterclockwise", label: "⟲ Counterclockwise" },
              { value: "clockwise", label: "⟳ Clockwise" },
            ]}
          />

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-16 h-10 rounded-md cursor-pointer bg-[#252525] border border-[#333]"
              />
              <Input
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
