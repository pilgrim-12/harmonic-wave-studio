"use client";

import React from "react";
import { Slider } from "@/components/ui/Slider";
import { Activity } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * Sample Rate Control Component
 * Allows user to adjust signal sample rate independently from visual FPS
 */
export const SampleRateControl: React.FC = () => {
  const { settings, updateSettings } = useSimulationStore();
  const { signalSampleRate } = settings;

  const handleChange = (value: number) => {
    updateSettings({ signalSampleRate: value });
  };

  const nyquistFrequency = signalSampleRate / 2;

  // Preset buttons
  const presets = [
    { label: "Low (100 Hz)", value: 100 },
    { label: "Medium (500 Hz)", value: 500 },
    { label: "High (1000 Hz)", value: 1000 },
    { label: "Very High (2000 Hz)", value: 2000 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2a]">
        <Activity size={16} className="text-[#667eea]" />
        <h3 className="text-sm font-semibold text-white">Signal Sample Rate</h3>
      </div>

      {/* Current Value */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Sample Rate</span>
        <span className="text-sm text-[#667eea] font-mono">
          {signalSampleRate} Hz
        </span>
      </div>

      {/* Slider */}
      <div>
        <Slider
          min={30}
          max={2000}
          step={10}
          value={signalSampleRate}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">30 Hz</span>
          <span className="text-[10px] text-gray-500">2000 Hz</span>
        </div>
      </div>

      {/* Nyquist Frequency Info */}
      <div className="p-2 bg-[#1a1a1a] rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Nyquist Frequency</span>
          <span className="text-xs text-green-400 font-mono">
            {nyquistFrequency} Hz
          </span>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Maximum frequency that can be accurately represented and filtered
        </p>
      </div>

      {/* Presets */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleChange(preset.value)}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                signalSampleRate === preset.value
                  ? "bg-[#667eea] text-white"
                  : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
        <p className="text-[10px] text-blue-400 leading-relaxed">
          <strong>Tip:</strong> Higher sample rates allow filtering higher
          frequencies but use more CPU. Use 500 Hz for general use, 1000+ Hz for
          audio/music signals.
        </p>
      </div>

      {/* Practical Examples */}
      <div className="p-2 bg-[#1a1a1a] rounded">
        <p className="text-xs text-gray-400 mb-1">Example Applications:</p>
        <ul className="text-[10px] text-gray-500 space-y-1">
          <li>• Voice: 100-300 Hz (200 Hz sample rate)</li>
          <li>• Music: 20-500 Hz (1000+ Hz sample rate)</li>
          <li>• ECG Signal: 0.5-150 Hz (500 Hz sample rate)</li>
          <li>• Seismic: 0.1-50 Hz (200 Hz sample rate)</li>
        </ul>
      </div>
    </div>
  );
};
