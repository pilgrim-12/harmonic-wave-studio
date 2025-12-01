"use client";

import React, { useEffect } from "react";
import { Target, Settings2, Eye, EyeOff, ZoomIn, ZoomOut } from "lucide-react";
import { ZPlaneCanvas } from "./ZPlaneCanvas";
import { useZPlaneStore } from "@/store/zplaneStore";
import { useFilterStore } from "@/store/filterStore";
import { useSimulationStore } from "@/store/simulationStore";
import { FullscreenWrapper } from "@/components/common/FullscreenGraphWrapper";
import { getStabilityDescription } from "@/lib/signal/zplane";

interface ZPlanePanelProps {
  className?: string;
}

export const ZPlanePanel: React.FC<ZPlanePanelProps> = ({ className = "" }) => {
  const {
    zplaneData,
    metrics,
    showUnitCircle,
    showGrid,
    showFrequencyMarkers,
    showStabilityRegion,
    zoomLevel,
    calculateFromCoefficients,
    clearData,
    setShowUnitCircle,
    setShowGrid,
    setShowFrequencyMarkers,
    setShowStabilityRegion,
    setZoomLevel,
  } = useZPlaneStore();

  const { filterCoefficients, isFilterApplied } = useFilterStore();
  const { settings } = useSimulationStore();
  const sampleRate = settings.signalSampleRate;

  // Recalculate when filter changes
  useEffect(() => {
    if (isFilterApplied && filterCoefficients) {
      calculateFromCoefficients(filterCoefficients, sampleRate);
    } else {
      clearData();
    }
  }, [filterCoefficients, isFilterApplied, sampleRate, calculateFromCoefficients, clearData]);

  // No filter applied state
  if (!isFilterApplied) {
    return (
      <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-[#f093fb]" />
          <h3 className="text-sm font-semibold text-white">Z-Plane</h3>
          <span className="text-xs text-gray-500">Poles & Zeros</span>
        </div>
        <div className="text-center text-gray-500 py-8">
          <Target size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Apply a filter to see poles and zeros</p>
          <p className="text-xs mt-1">Poles determine stability and resonance</p>
          <p className="text-xs">Zeros determine frequency nulls</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!zplaneData) {
    return (
      <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-[#f093fb]" />
          <h3 className="text-sm font-semibold text-white">Z-Plane</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">Calculating poles and zeros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-[#f093fb]" />
          <h3 className="text-sm font-semibold text-white">Z-Plane</h3>
          <span className="text-xs text-gray-500">Poles & Zeros</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(zoomLevel - 0.25)}
            className="p-1.5 rounded bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{zoomLevel.toFixed(2)}x</span>
          <button
            onClick={() => setZoomLevel(zoomLevel + 0.25)}
            className="p-1.5 rounded bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Visualization */}
        <FullscreenWrapper>
          <div className="h-[250px]">
            <ZPlaneCanvas
              zplaneData={zplaneData}
              showUnitCircle={showUnitCircle}
              showGrid={showGrid}
              showFrequencyMarkers={showFrequencyMarkers}
              showStabilityRegion={showStabilityRegion}
              zoomLevel={zoomLevel}
              sampleRate={sampleRate}
            />
          </div>
        </FullscreenWrapper>

        {/* Display Toggles */}
        <div className="pt-2 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-1 mb-2">
            <Settings2 size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400">Display</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowUnitCircle(!showUnitCircle)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showUnitCircle ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showUnitCircle ? <Eye size={12} /> : <EyeOff size={12} />}
              Unit Circle
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showGrid ? "bg-[#54a0ff]/20 text-[#54a0ff]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showGrid ? <Eye size={12} /> : <EyeOff size={12} />}
              Grid
            </button>
            <button
              onClick={() => setShowFrequencyMarkers(!showFrequencyMarkers)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showFrequencyMarkers ? "bg-[#feca57]/20 text-[#feca57]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showFrequencyMarkers ? <Eye size={12} /> : <EyeOff size={12} />}
              Freq Markers
            </button>
            <button
              onClick={() => setShowStabilityRegion(!showStabilityRegion)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showStabilityRegion ? "bg-[#f093fb]/20 text-[#f093fb]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showStabilityRegion ? <Eye size={12} /> : <EyeOff size={12} />}
              Stable Region
            </button>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Poles</div>
              <div className="text-sm font-mono text-[#f093fb]">{metrics.numPoles}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Zeros</div>
              <div className="text-sm font-mono text-[#54a0ff]">{metrics.numZeros}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">DC Gain</div>
              <div className="text-sm font-mono text-[#00ff88]">
                {metrics.dcGain.toFixed(1)} dB
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Stability</div>
              <div className={`text-sm font-mono ${metrics.isStable ? "text-[#00ff88]" : "text-[#ff6b6b]"}`}>
                {(metrics.stabilityMargin * 100).toFixed(1)}%
              </div>
            </div>
            {metrics.dominantPoleFreq !== null && (
              <>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Dom. Pole</div>
                  <div className="text-sm font-mono text-[#feca57]">
                    {metrics.dominantPoleFreq.toFixed(1)} Hz
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Q Factor</div>
                  <div className="text-sm font-mono text-[#feca57]">
                    {metrics.dominantPoleQ?.toFixed(2) || "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Stability Description */}
        {metrics && (
          <div className={`p-2 rounded border ${
            metrics.isStable
              ? "bg-[#00ff88]/10 border-[#00ff88]/30"
              : "bg-[#ff6b6b]/10 border-[#ff6b6b]/30"
          }`}>
            <p className={`text-xs ${metrics.isStable ? "text-[#00ff88]" : "text-[#ff6b6b]"}`}>
              {getStabilityDescription(metrics.stabilityMargin)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
