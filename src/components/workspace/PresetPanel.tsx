"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { WAVEFORM_PRESETS, WaveformPreset } from "@/lib/presets/waveforms";
import { Button } from "@/components/ui/Button";

export const PresetPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearRadii, addRadius } = useRadiusStore();

  const loadPreset = (preset: WaveformPreset) => {
    // Clear existing radii
    clearRadii();

    // Add radii from preset sequentially (linear chain)
    let parentId: string | null = null;

    preset.radii.forEach((radiusData) => {
      const newRadiusId = addRadius({
        parentId,
        length: radiusData.length,
        initialAngle: radiusData.initialAngle,
        rotationSpeed: radiusData.rotationSpeed,
        direction: radiusData.direction,
        color: radiusData.color,
      });

      // Next radius will be child of this one
      parentId = newRadiusId;
    });

    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Preset button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title="Load preset waveform"
      >
        <Sparkles size={14} />
        Presets
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 z-20 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-[#667eea]">
                Waveform Presets
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {WAVEFORM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="w-full text-left p-3 hover:bg-[#252525] transition-colors border-b border-[#222] last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white mb-1">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded flex-shrink-0">
                      {preset.radii.length} radii
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
