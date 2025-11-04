"use client";

import React, { useState, useMemo } from "react";
import { X, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FFTAnalysisResult } from "@/types/fourier";

interface GenerationSettingsDialogProps {
  analysisResult: FFTAnalysisResult;
  onGenerate: (settings: GenerationSettings) => void;
  onClose: () => void;
}

export interface GenerationSettings {
  maxRadii: number;
  minAmplitude: number;
  scaleFactor: number;
  includeDC: boolean;
  sortBy: "amplitude" | "frequency";
}

export const GenerationSettingsDialog: React.FC<
  GenerationSettingsDialogProps
> = ({ analysisResult, onGenerate, onClose }) => {
  const [maxRadii, setMaxRadii] = useState(10);
  const [minAmplitude, setMinAmplitude] = useState(0.05);
  const [scaleFactor, setScaleFactor] = useState(50);
  const [includeDC, setIncludeDC] = useState(false);

  // Calculate preview stats
  const preview = useMemo(() => {
    const filteredPeaks = analysisResult.peaks.filter(
      (peak) => peak.relativeAmplitude >= minAmplitude
    );
    const willGenerate = Math.min(filteredPeaks.length, maxRadii);

    // Calculate total energy captured
    const topPeaks = filteredPeaks
      .sort((a, b) => b.amplitude - a.amplitude)
      .slice(0, willGenerate);
    const capturedEnergy =
      topPeaks.reduce((sum, peak) => sum + peak.amplitude, 0) /
      analysisResult.peaks.reduce((sum, peak) => sum + peak.amplitude, 0);

    return {
      totalPeaks: analysisResult.peaks.length,
      filteredPeaks: filteredPeaks.length,
      willGenerate,
      energyPercent: (capturedEnergy * 100).toFixed(1),
    };
  }, [analysisResult, maxRadii, minAmplitude]);

  const handleGenerate = () => {
    onGenerate({
      maxRadii,
      minAmplitude,
      scaleFactor,
      includeDC,
      sortBy: "amplitude",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#667eea]" />
            Generation Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Number of Radii */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Number of Radii
              </label>
              <span className="text-sm font-bold text-[#667eea]">
                {maxRadii}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={maxRadii}
              onChange={(e) => setMaxRadii(parseInt(e.target.value))}
              className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 (fast)</span>
              <span>20 (accurate)</span>
            </div>
          </div>

          {/* Scale Factor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Scale Factor
              </label>
              <span className="text-sm font-bold text-[#667eea]">
                {scaleFactor}px
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(parseInt(e.target.value))}
              className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20 (small)</span>
              <span>150 (large)</span>
            </div>
          </div>

          {/* Min Amplitude Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Min Amplitude
              </label>
              <span className="text-sm font-bold text-[#667eea]">
                {(minAmplitude * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.30"
              step="0.01"
              value={minAmplitude}
              onChange={(e) => setMinAmplitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1% (include weak)</span>
              <span>30% (strong only)</span>
            </div>
          </div>

          {/* Include DC Offset */}
          <div className="flex items-center justify-between bg-[#252525] rounded-lg p-3">
            <div>
              <label className="text-sm font-medium text-gray-300 block">
                Include DC Offset
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Add 0 Hz component (baseline shift)
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeDC}
              onChange={(e) => setIncludeDC(e.target.checked)}
              className="w-5 h-5 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#667eea] focus:ring-2 focus:ring-[#667eea] cursor-pointer"
            />
          </div>

          {/* Preview Stats */}
          <div className="bg-[#252525] rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-[#667eea]" />
              <span className="text-xs font-semibold text-gray-300">
                Preview
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Total peaks:</span>
                <span className="text-white ml-1 font-medium">
                  {preview.totalPeaks}
                </span>
              </div>
              <div>
                <span className="text-gray-500">After filter:</span>
                <span className="text-white ml-1 font-medium">
                  {preview.filteredPeaks}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Will generate:</span>
                <span className="text-[#667eea] ml-1 font-bold">
                  {preview.willGenerate} radii
                </span>
              </div>
              <div>
                <span className="text-gray-500">Energy captured:</span>
                <span className="text-[#667eea] ml-1 font-bold">
                  {preview.energyPercent}%
                </span>
              </div>
            </div>

            {preview.willGenerate === 0 && (
              <div className="text-xs text-yellow-500 mt-2">
                ⚠️ No radii will be generated. Decrease min amplitude.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#2a2a2a]">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            variant="primary"
            className="flex-1"
            disabled={preview.willGenerate === 0}
          >
            <Sparkles size={14} className="mr-1" />
            Generate {preview.willGenerate} Radii
          </Button>
        </div>
      </div>
    </div>
  );
};
