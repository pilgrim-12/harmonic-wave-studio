"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Radius, UpdateRadiusParams } from "@/types/radius";
import { useRadiusStore } from "@/store/radiusStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";

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

  const [showColorPicker, setShowColorPicker] = useState(false);

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

  const handleToggleDirection = () => {
    setFormData({
      ...formData,
      direction:
        formData.direction === "clockwise" ? "counterclockwise" : "clockwise",
    });
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

          {/* Amplitude */}
          <Slider
            label="Amplitude"
            min={5}
            max={200}
            value={formData.length}
            onChange={(e) =>
              setFormData({ ...formData, length: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v}`}
          />

          {/* Phase */}
          <Slider
            label="Phase (°)"
            min={0}
            max={360}
            value={formData.initialAngle}
            onChange={(e) =>
              setFormData({ ...formData, initialAngle: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v}°`}
          />

          {/* Frequency */}
          <Slider
            label="Frequency (Hz)"
            min={0.1}
            max={10}
            step={0.1}
            value={formData.rotationSpeed}
            onChange={(e) =>
              setFormData({
                ...formData,
                rotationSpeed: Number(e.target.value),
              })
            }
            valueFormatter={(v) => `${v.toFixed(1)} Hz`}
          />

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Direction
            </label>
            <button
              type="button"
              onClick={handleToggleDirection}
              className="w-full px-4 py-2 bg-[#252525] hover:bg-[#333] rounded text-sm text-gray-300 hover:text-[#667eea] transition-colors"
            >
              {formData.direction === "counterclockwise"
                ? "⟲ Counterclockwise"
                : "⟳ Clockwise"}
            </button>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Color
            </label>
            <div className="relative">
              <div
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-12 rounded-md cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all"
                style={{ backgroundColor: formData.color }}
              />
              {showColorPicker && (
                <div className="absolute z-10 bg-[#252525] border border-[#333] rounded-lg p-3 shadow-xl mt-2">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {commonColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, color });
                          setShowColorPicker(false);
                        }}
                        className="w-10 h-10 rounded hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              )}
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
