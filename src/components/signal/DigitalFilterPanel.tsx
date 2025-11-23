"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

export interface FilterSettings {
  type: "butterworth" | "chebyshev1" | "chebyshev2";
  mode: "lowpass" | "highpass" | "bandpass" | "bandstop";
  order: number;
  cutoffFreq: number; // In Hz (will be normalized internally)
  enabled: boolean;
}

interface DigitalFilterPanelProps {
  onApplyFilter: (settings: FilterSettings) => void;
  onClearFilter: () => void;
  isFilterApplied: boolean;
  sampleRate?: number;
}

export const DigitalFilterPanel: React.FC<DigitalFilterPanelProps> = ({
  onApplyFilter,
  onClearFilter,
  isFilterApplied,
}) => {
  // Get actual sample rate from settings
  const { settings } = useSimulationStore();
  const sampleRate = settings.signalSampleRate;
  const [filterType, setFilterType] =
    useState<FilterSettings["type"]>("butterworth");
  const [filterMode, setFilterMode] =
    useState<FilterSettings["mode"]>("lowpass");
  const [order, setOrder] = useState(2);
  const [cutoffFreq, setCutoffFreq] = useState(1.5);

  // Auto-reapply filter when parameters change (only if filter is already applied)
  useEffect(() => {
    if (isFilterApplied) {
      // Debounce: wait 300ms after last change before reapplying
      const timer = setTimeout(() => {
        onApplyFilter({
          type: filterType,
          mode: filterMode,
          order,
          cutoffFreq,
          enabled: true,
        });
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterMode, order, cutoffFreq, isFilterApplied]);

  const handleApply = () => {
    onApplyFilter({
      type: filterType,
      mode: filterMode,
      order,
      cutoffFreq,
      enabled: true,
    });
  };

  const handleClear = () => {
    onClearFilter();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2a]">
        <Filter size={16} className="text-[#667eea]" />
        <h3 className="text-sm font-semibold text-white">Digital Filters</h3>
      </div>

      {/* Filter Type */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Filter Type</label>
        <Select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as FilterSettings["type"])
          }
          className="w-full"
          options={[
            { value: "butterworth", label: "Butterworth" },
            { value: "chebyshev1", label: "Chebyshev Type I" },
            { value: "chebyshev2", label: "Chebyshev Type II" },
          ]}
        />
      </div>

      {/* Filter Mode */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilterMode("lowpass")}
            className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              filterMode === "lowpass"
                ? "bg-[#667eea] text-white"
                : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
            }`}
          >
            <TrendingDown size={12} />
            Low-pass
          </button>
          <button
            onClick={() => setFilterMode("highpass")}
            className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              filterMode === "highpass"
                ? "bg-[#667eea] text-white"
                : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
            }`}
          >
            <TrendingUp size={12} />
            High-pass
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => setFilterMode("bandpass")}
            className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
              filterMode === "bandpass"
                ? "bg-[#667eea] text-white"
                : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
            }`}
            disabled
            title="Coming soon"
          >
            Band-pass
          </button>
          <button
            onClick={() => setFilterMode("bandstop")}
            className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
              filterMode === "bandstop"
                ? "bg-[#667eea] text-white"
                : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
            }`}
            disabled
            title="Coming soon"
          >
            Band-stop
          </button>
        </div>
      </div>

      {/* Cutoff Frequency */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Cutoff Frequency</label>
          <span className="text-xs text-[#667eea] font-mono">
            {cutoffFreq.toFixed(2)} Hz
          </span>
        </div>
        <Slider
          min={0.1}
          max={sampleRate / 2} // Nyquist frequency
          step={0.1}
          value={cutoffFreq}
          onChange={(e) => setCutoffFreq(parseFloat(e.target.value))}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">0.1 Hz</span>
          <span className="text-[10px] text-gray-500">
            {(sampleRate / 2).toFixed(1)} Hz (Nyquist)
          </span>
        </div>
      </div>

      {/* Filter Order */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Filter Order</label>
          <span className="text-xs text-[#667eea] font-mono">{order}</span>
        </div>
        <Slider
          min={1}
          max={4}
          step={1}
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value))}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">1st order</span>
          <span className="text-[10px] text-gray-500">4th order</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Higher order = steeper cutoff
        </p>
      </div>

      {/* Apply/Clear Buttons */}
      <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
        {!isFilterApplied ? (
          <Button
            onClick={handleApply}
            variant="primary"
            className="w-full text-sm"
          >
            <Filter size={14} className="mr-1" />
            Apply Filter
          </Button>
        ) : (
          <Button
            onClick={handleClear}
            variant="secondary"
            className="w-full text-sm"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Info */}
      {isFilterApplied && (
        <div className="p-2 bg-[#667eea]/10 border border-[#667eea]/20 rounded">
          <p className="text-xs text-gray-400">
            ✓ Filter active (real-time updates)
          </p>
        </div>
      )}

      {/* Description */}
      <div className="p-2 bg-[#1a1a1a] rounded">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          {filterMode === "lowpass" && (
            <>
              <strong className="text-gray-400">Low-pass:</strong> Removes
              high-frequency components, smooths the signal
            </>
          )}
          {filterMode === "highpass" && (
            <>
              <strong className="text-gray-400">High-pass:</strong> Removes
              low-frequency components, emphasizes changes
            </>
          )}
        </p>
      </div>
    </div>
  );
};
