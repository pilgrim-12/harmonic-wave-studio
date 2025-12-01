"use client";

import React, { useEffect } from "react";
import { Activity, TrendingUp, Clock, BarChart2, Settings2 } from "lucide-react";
import { FrequencyResponseCanvas } from "./FrequencyResponseCanvas";
import { useFrequencyResponseStore, ResponseViewMode, ScaleMode } from "@/store/frequencyResponseStore";
import { useFilterStore } from "@/store/filterStore";
import { useSimulationStore } from "@/store/simulationStore";
import { FullscreenWrapper } from "@/components/common/FullscreenGraphWrapper";

interface FrequencyResponsePanelProps {
  className?: string;
}

export const FrequencyResponsePanel: React.FC<FrequencyResponsePanelProps> = ({
  className = "",
}) => {
  const {
    responseData,
    metrics,
    viewMode,
    frequencyScale,
    showGrid,
    showMarkers,
    showCutoffLine,
    setViewMode,
    setFrequencyScale,
    setShowGrid,
    setShowMarkers,
    setShowCutoffLine,
    calculateResponse,
    clearResponse,
  } = useFrequencyResponseStore();

  const { filterCoefficients, isFilterApplied, filterSettings } = useFilterStore();
  const { settings } = useSimulationStore();
  const sampleRate = settings.signalSampleRate;

  // Recalculate when filter changes
  useEffect(() => {
    if (isFilterApplied && filterCoefficients) {
      calculateResponse(filterCoefficients, sampleRate);
    } else {
      clearResponse();
    }
  }, [filterCoefficients, isFilterApplied, sampleRate, calculateResponse, clearResponse]);

  // View mode buttons
  const viewModes: { mode: ResponseViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: "magnitude", label: "АЧХ", icon: <BarChart2 size={12} /> },
    { mode: "phase", label: "ФЧХ", icon: <TrendingUp size={12} /> },
    { mode: "both", label: "Both", icon: <Activity size={12} /> },
    { mode: "groupDelay", label: "GD", icon: <Clock size={12} /> },
  ];

  // Scale mode buttons
  const scaleModes: { scale: ScaleMode; label: string }[] = [
    { scale: "log", label: "Log" },
    { scale: "linear", label: "Lin" },
  ];

  if (!isFilterApplied) {
    return (
      <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-semibold text-white">Frequency Response (АЧХ/ФЧХ)</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Apply a filter to see its frequency response</p>
          <p className="text-xs mt-1">АЧХ — Amplitude-Frequency Response</p>
          <p className="text-xs">ФЧХ — Phase-Frequency Response</p>
        </div>
      </div>
    );
  }

  if (!responseData) {
    return (
      <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-semibold text-white">Frequency Response</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">Calculating frequency response...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-semibold text-white">Frequency Response</h3>
          {filterSettings && (
            <span className="text-xs text-gray-500">
              ({filterSettings.type} {filterSettings.mode}, order {filterSettings.order})
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex rounded overflow-hidden border border-[#2a2a2a]">
            {viewModes.map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                  viewMode === mode
                    ? "bg-[#667eea] text-white"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]"
                }`}
                title={mode === "magnitude" ? "Amplitude-Frequency Response (АЧХ)" :
                       mode === "phase" ? "Phase-Frequency Response (ФЧХ)" :
                       mode === "groupDelay" ? "Group Delay" : "Both АЧХ and ФЧХ"}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Scale Selector */}
          <div className="flex rounded overflow-hidden border border-[#2a2a2a]">
            {scaleModes.map(({ scale, label }) => (
              <button
                key={scale}
                onClick={() => setFrequencyScale(scale)}
                className={`px-2 py-1 text-xs transition-colors ${
                  frequencyScale === scale
                    ? "bg-[#667eea] text-white"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Settings Dropdown */}
          <div className="relative group">
            <button className="p-1.5 rounded bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] transition-colors">
              <Settings2 size={14} />
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-[#1a1a1a] border border-[#2a2a2a] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <label className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#252525] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#252525] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded"
                />
                Show Markers
              </label>
              <label className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#252525] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutoffLine}
                  onChange={(e) => setShowCutoffLine(e.target.checked)}
                  className="rounded"
                />
                Show -3dB Line
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="p-3">
        {viewMode === "both" ? (
          <div className="grid grid-cols-2 gap-3 h-[180px]">
            {/* Magnitude (АЧХ) */}
            <FullscreenWrapper>
              <FrequencyResponseCanvas
                responseData={responseData}
                metrics={metrics}
                mode="magnitude"
                frequencyScale={frequencyScale}
                showGrid={showGrid}
                showMarkers={showMarkers}
                showCutoffLine={showCutoffLine}
                title="АЧХ (Magnitude)"
                yAxisLabel="Magnitude (dB)"
                color="#667eea"
              />
            </FullscreenWrapper>

            {/* Phase (ФЧХ) */}
            <FullscreenWrapper>
              <FrequencyResponseCanvas
                responseData={responseData}
                metrics={metrics}
                mode="phase"
                frequencyScale={frequencyScale}
                showGrid={showGrid}
                showMarkers={false}
                showCutoffLine={false}
                title="ФЧХ (Phase)"
                yAxisLabel="Phase (°)"
                color="#f093fb"
              />
            </FullscreenWrapper>
          </div>
        ) : (
          <FullscreenWrapper>
            <div className="h-[200px]">
              <FrequencyResponseCanvas
                responseData={responseData}
                metrics={metrics}
                mode={viewMode}
                frequencyScale={frequencyScale}
                showGrid={showGrid}
                showMarkers={showMarkers}
                showCutoffLine={showCutoffLine}
                title={viewMode === "magnitude" ? "АЧХ (Amplitude-Frequency Response)" :
                       viewMode === "phase" ? "ФЧХ (Phase-Frequency Response)" :
                       "Group Delay"}
                color={viewMode === "magnitude" ? "#667eea" :
                       viewMode === "phase" ? "#f093fb" : "#54a0ff"}
              />
            </div>
          </FullscreenWrapper>
        )}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-4 gap-2 p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">-3dB Cutoff</div>
              <div className="text-sm font-mono text-[#667eea]">
                {metrics.cutoff3dB ? `${metrics.cutoff3dB.toFixed(2)} Hz` : "N/A"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">DC Gain</div>
              <div className="text-sm font-mono text-[#667eea]">
                {metrics.dcGain.toFixed(2)} dB
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Peak Gain</div>
              <div className="text-sm font-mono text-[#667eea]">
                {metrics.peakGain.toFixed(2)} dB
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Bandwidth</div>
              <div className="text-sm font-mono text-[#667eea]">
                {metrics.bandwidth ? `${metrics.bandwidth.bandwidth.toFixed(2)} Hz` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
