"use client";

import React, { useMemo } from "react";
import {
  LFOConfig,
  LFOPreset,
  LFOWaveform,
  LFOTarget,
  DEFAULT_LFO,
  LFO_PRESETS
} from "@/types/radius";
import { Tooltip } from "@/components/ui/Tooltip";
import { Waves } from "lucide-react";

interface LFOEditorProps {
  lfo?: LFOConfig;
  onChange: (lfo: LFOConfig) => void;
}

export const LFOEditor: React.FC<LFOEditorProps> = ({
  lfo,
  onChange,
}) => {
  const currentLFO = lfo || DEFAULT_LFO;

  const handleToggleEnabled = () => {
    onChange({
      ...currentLFO,
      enabled: !currentLFO.enabled,
    });
  };

  const handlePresetChange = (preset: LFOPreset) => {
    if (preset === "none") {
      onChange({ ...currentLFO, enabled: false });
    } else if (preset === "custom") {
      onChange({ ...currentLFO, enabled: true });
    } else {
      const presetConfig = LFO_PRESETS[preset];
      onChange({
        ...DEFAULT_LFO,
        ...presetConfig,
        enabled: true,
      });
    }
  };

  const handleParamChange = (param: keyof LFOConfig, value: number | boolean | string) => {
    onChange({
      ...currentLFO,
      [param]: value,
    });
  };

  // Generate SVG path for LFO waveform visualization
  const waveformPath = useMemo(() => {
    const { waveform } = currentLFO;
    const width = 100;
    const height = 30;
    const midY = height / 2;
    const amplitude = height / 2 - 4;
    const points: string[] = [];

    for (let i = 0; i <= width; i++) {
      const t = (i / width) * 4 * Math.PI; // Two full cycles
      let y: number;

      switch (waveform) {
        case "sine":
          y = midY - amplitude * Math.sin(t);
          break;
        case "square":
          y = midY - amplitude * (Math.sin(t) >= 0 ? 1 : -1);
          break;
        case "triangle":
          const normalized = (t / (2 * Math.PI)) % 1;
          y = midY - amplitude * (4 * Math.abs(normalized - 0.5) - 1);
          break;
        case "sawtooth":
          y = midY - amplitude * (2 * ((t / (2 * Math.PI)) % 1) - 1);
          break;
        default:
          y = midY;
      }

      points.push(`${i === 0 ? "M" : "L"} ${i} ${y}`);
    }

    return points.join(" ");
  }, [currentLFO.waveform]);

  const waveforms: LFOWaveform[] = ["sine", "square", "triangle", "sawtooth"];
  const targets: LFOTarget[] = ["amplitude", "frequency", "phase"];

  const getWaveformIcon = (wf: LFOWaveform) => {
    switch (wf) {
      case "sine": return "∿";
      case "square": return "⊓";
      case "triangle": return "△";
      case "sawtooth": return "⫽";
      default: return "~";
    }
  };

  const getTargetLabel = (target: LFOTarget) => {
    switch (target) {
      case "amplitude": return "Amp";
      case "frequency": return "Freq";
      case "phase": return "Phase";
      default: return target;
    }
  };

  return (
    <div className="space-y-2 pt-1">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Tooltip
          content={
            <div className="max-w-xs">
              <div className="font-semibold mb-0.5">LFO (Low Frequency Oscillator)</div>
              <div className="text-[10px] text-gray-300">
                Modulates amplitude, frequency, or phase with a periodic waveform.
                Creates vibrato, tremolo, and wobble effects.
              </div>
            </div>
          }
          className="!whitespace-normal !w-48"
        >
          <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600 flex items-center gap-1">
            <Waves size={10} />
            LFO
          </label>
        </Tooltip>
        <button
          onClick={handleToggleEnabled}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            currentLFO.enabled
              ? "bg-green-500/20 text-green-400"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
          }`}
        >
          {currentLFO.enabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* LFO visualization and controls */}
      {currentLFO.enabled && (
        <>
          <div className="bg-[#0a0a0a] rounded p-1.5 border border-[#333]">
            <svg
              viewBox="0 0 100 30"
              className="w-full h-8"
              preserveAspectRatio="none"
            >
              {/* Center line */}
              <line x1="0" y1="15" x2="100" y2="15" stroke="#333" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Waveform */}
              <path
                d={waveformPath}
                fill="none"
                stroke="#f093fb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Preset selector */}
          <div className="flex gap-1 flex-wrap">
            {(["vibrato", "tremolo", "wobble", "pulse"] as LFOPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className="px-1.5 py-0.5 bg-[#1a1a1a] hover:bg-[#333] rounded text-[9px] text-gray-400 hover:text-white transition-colors capitalize"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Waveform selector */}
          <div className="flex gap-1">
            {waveforms.map((wf) => (
              <button
                key={wf}
                onClick={() => handleParamChange("waveform", wf)}
                className={`flex-1 px-1 py-1 rounded text-[12px] transition-colors ${
                  currentLFO.waveform === wf
                    ? "bg-[#f093fb]/20 text-[#f093fb]"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
                }`}
                title={wf}
              >
                {getWaveformIcon(wf)}
              </button>
            ))}
          </div>

          {/* Target selector */}
          <div className="flex gap-1">
            {targets.map((target) => (
              <button
                key={target}
                onClick={() => handleParamChange("target", target)}
                className={`flex-1 px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                  currentLFO.target === target
                    ? "bg-[#f093fb]/20 text-[#f093fb]"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
                }`}
              >
                {getTargetLabel(target)}
              </button>
            ))}
          </div>

          {/* Rate and Depth sliders */}
          <div className="space-y-2">
            {/* Rate */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Rate</span>
                <span className="text-[9px] text-[#f093fb]">{currentLFO.rate.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={currentLFO.rate}
                onChange={(e) => handleParamChange("rate", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#f093fb] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Depth */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Depth</span>
                <span className="text-[9px] text-[#f093fb]">{Math.round(currentLFO.depth * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentLFO.depth}
                onChange={(e) => handleParamChange("depth", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#f093fb] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
