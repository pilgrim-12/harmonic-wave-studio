"use client";

import React, { useState } from "react";
import { Sparkles, Info, Lock, Calculator } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useProjectStore } from "@/store/useProjectStore";
import { WAVEFORM_PRESETS, WaveformPreset } from "@/lib/presets/waveforms";
import { Button } from "@/components/ui/Button";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useUpgradeModal } from "@/components/tier/UpgradeModalProvider";
import { FormulaImportModal } from "./FormulaImportModal";

export const PresetPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const { clearRadii, addRadius, selectRadius } = useRadiusStore();
  const { setActiveTrackingRadius } = useSimulationStore();
  const { setCurrentProject } = useProjectStore();
  const { hasAccess } = useTierCheck("canUsePresets");
  const { showUpgradeModal } = useUpgradeModal();

  const loadPreset = (preset: WaveformPreset) => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canUsePresets");
      setIsOpen(false);
      return;
    }

    // Clear existing radii
    clearRadii();

    // Add radii from preset sequentially (linear chain)
    let parentId: string | null = null;
    let lastRadiusId: string | null = null;

    preset.radii.forEach((radiusData) => {
      const newRadiusId = addRadius({
        parentId,
        length: radiusData.length,
        initialAngle: radiusData.initialAngle,
        rotationSpeed: radiusData.rotationSpeed,
        direction: radiusData.direction,
        color: radiusData.color,
      });

      // Apply modulation parameters if present
      if (radiusData.envelope || radiusData.sweep || radiusData.lfo || radiusData.timeline) {
        const { updateRadius } = useRadiusStore.getState();
        updateRadius(newRadiusId, {
          ...(radiusData.envelope && { envelope: radiusData.envelope }),
          ...(radiusData.sweep && { sweep: radiusData.sweep }),
          ...(radiusData.lfo && { lfo: radiusData.lfo }),
          ...(radiusData.timeline && { timeline: radiusData.timeline }),
        });
      }

      // Track last radius
      lastRadiusId = newRadiusId;

      // Next radius will be child of this one
      parentId = newRadiusId;
    });

    // Auto-select and track the last radius from preset
    if (lastRadiusId) {
      const radiusIdToSelect = lastRadiusId;
      requestAnimationFrame(() => {
        selectRadius(radiusIdToSelect);
        useSimulationStore.getState().setActiveTrackingRadius(radiusIdToSelect);
        useSimulationStore.getState().toggleTrailTracking(radiusIdToSelect);
      });
    }

    // Set preset name in project store
    setCurrentProject(null, preset.name);

    // Close dropdown
    setIsOpen(false);
  };

  const togglePresetExpansion = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading preset
    setExpandedPreset(expandedPreset === presetId ? null : presetId);
  };

  return (
    <div className="relative">
      {/* Preset button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title={hasAccess ? "Load preset waveform" : "Sign in to use presets"}
      >
        {!hasAccess && <Lock size={12} className="text-gray-500" />}
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
          <div className="absolute top-full mt-2 right-0 z-20 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-[#667eea]">
                Waveform Presets
              </h3>
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {WAVEFORM_PRESETS.map((preset) => {
                const isExpanded = expandedPreset === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="border-b border-[#222] last:border-b-0"
                  >
                    {/* ✨ FIXED: Separate info button from main button */}
                    <div className="flex items-start gap-0">
                      {/* Main preset button */}
                      <button
                        onClick={() => loadPreset(preset)}
                        className="flex-1 text-left p-3 hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white mb-1">
                              {preset.name}
                            </h4>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {preset.description}
                            </p>

                            {/* ✨ Category badge */}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  preset.category === "basic"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : preset.category === "advanced"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : preset.category === "modulation"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {preset.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {preset.radii.length} radii
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* ✨ Info button - OUTSIDE main button */}
                      {preset.mathExplanation && (
                        <button
                          onClick={(e) => togglePresetExpansion(preset.id, e)}
                          className="flex-shrink-0 p-3 hover:bg-[#2a2a2a] transition-colors"
                          title="Show formula"
                        >
                          <Info size={16} className="text-[#667eea]" />
                        </button>
                      )}
                    </div>

                    {/* ✨ Expanded math formula section */}
                    {isExpanded && preset.mathExplanation && (
                      <div className="px-3 pb-3 bg-[#252525]">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles
                            size={14}
                            className="text-[#667eea] mt-0.5 flex-shrink-0"
                          />
                          <span className="text-xs font-semibold text-[#667eea]">
                            Mathematical Formula:
                          </span>
                        </div>
                        <div className="bg-[#0a0a0a] rounded p-3 border border-[#2a2a2a]">
                          <code className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                            {preset.mathExplanation}
                          </code>
                        </div>

                        {/* Additional info */}
                        <div className="mt-2 text-xs text-gray-500">
                          Click anywhere outside to close
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Formula Import button */}
            <div className="p-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsFormulaModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-[#667eea]/10 hover:bg-[#667eea]/20 rounded-lg transition-colors"
              >
                <Calculator size={16} className="text-[#667eea]" />
                <div className="text-left">
                  <div className="text-sm font-medium text-[#667eea]">Import from Formula</div>
                  <div className="text-xs text-gray-500">Enter a Fourier series equation</div>
                </div>
              </button>
            </div>

            {/* Footer hint */}
            <div className="p-2 border-t border-[#2a2a2a] bg-[#0f0f0f]">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info size={12} />
                Click <Info size={12} className="text-[#667eea]" /> to see
                formulas
              </p>
            </div>
          </div>
        </>
      )}

      {/* Formula Import Modal */}
      <FormulaImportModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />
    </div>
  );
};
