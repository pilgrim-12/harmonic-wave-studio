"use client";

import React, { useMemo } from "react";
import {
  EnvelopeConfig,
  EnvelopePreset,
  DEFAULT_ENVELOPE,
  ENVELOPE_PRESETS
} from "@/types/radius";
import { Tooltip } from "@/components/ui/Tooltip";
import { Activity } from "lucide-react";

interface EnvelopeEditorProps {
  envelope?: EnvelopeConfig;
  onChange: (envelope: EnvelopeConfig) => void;
}

export const EnvelopeEditor: React.FC<EnvelopeEditorProps> = ({
  envelope,
  onChange,
}) => {
  const currentEnvelope = envelope || DEFAULT_ENVELOPE;

  const handleToggleEnabled = () => {
    onChange({
      ...currentEnvelope,
      enabled: !currentEnvelope.enabled,
    });
  };

  const handlePresetChange = (preset: EnvelopePreset) => {
    if (preset === "none") {
      onChange({ ...currentEnvelope, enabled: false });
    } else if (preset === "custom") {
      onChange({ ...currentEnvelope, enabled: true });
    } else {
      const presetConfig = ENVELOPE_PRESETS[preset];
      onChange({
        ...DEFAULT_ENVELOPE,
        ...presetConfig,
        enabled: true,
      });
    }
  };

  const handleParamChange = (param: keyof EnvelopeConfig, value: number | boolean | string) => {
    onChange({
      ...currentEnvelope,
      [param]: value,
    });
  };

  // Generate SVG path for envelope visualization
  const envelopePath = useMemo(() => {
    const { attack, decay, sustain, release, curve } = currentEnvelope;
    const width = 100;
    const height = 30;
    const total = attack + decay + release;

    if (total === 0) return `M 0 ${height} L ${width} ${height}`;

    const attackEnd = (attack / total) * width * 0.8;
    const decayEnd = attackEnd + (decay / total) * width * 0.8;
    const sustainEnd = decayEnd + 10; // Fixed sustain display width
    const releaseEnd = width;

    const peakY = 2;
    const sustainY = height - (sustain * (height - 4)) - 2;
    const bottomY = height - 2;

    if (curve === "exponential") {
      return `
        M 0 ${bottomY}
        Q ${attackEnd * 0.3} ${bottomY} ${attackEnd} ${peakY}
        Q ${attackEnd + (decayEnd - attackEnd) * 0.5} ${sustainY * 0.5} ${decayEnd} ${sustainY}
        L ${sustainEnd} ${sustainY}
        Q ${sustainEnd + (releaseEnd - sustainEnd) * 0.7} ${sustainY + (bottomY - sustainY) * 0.3} ${releaseEnd} ${bottomY}
      `.trim();
    }

    return `
      M 0 ${bottomY}
      L ${attackEnd} ${peakY}
      L ${decayEnd} ${sustainY}
      L ${sustainEnd} ${sustainY}
      L ${releaseEnd} ${bottomY}
    `.trim();
  }, [currentEnvelope]);

  return (
    <div className="space-y-2 pt-1">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Tooltip
          content={
            <div className="max-w-xs">
              <div className="font-semibold mb-0.5">ADSR Envelope</div>
              <div className="text-[10px] text-gray-300">
                Controls how amplitude changes over time.
                Attack, Decay, Sustain, Release.
              </div>
            </div>
          }
          className="!whitespace-normal !w-48"
        >
          <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600 flex items-center gap-1">
            <Activity size={10} />
            Envelope
          </label>
        </Tooltip>
        <button
          onClick={handleToggleEnabled}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            currentEnvelope.enabled
              ? "bg-green-500/20 text-green-400"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
          }`}
        >
          {currentEnvelope.enabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Envelope visualization */}
      {currentEnvelope.enabled && (
        <>
          <div className="bg-[#0a0a0a] rounded p-1.5 border border-[#333]">
            <svg
              viewBox="0 0 100 30"
              className="w-full h-8"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line x1="0" y1="15" x2="100" y2="15" stroke="#333" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Envelope curve */}
              <path
                d={envelopePath}
                fill="none"
                stroke="#667eea"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Fill under curve */}
              <path
                d={envelopePath + " L 100 28 L 0 28 Z"}
                fill="url(#envelopeGradient)"
                opacity="0.3"
              />

              <defs>
                <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels */}
            <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
              <span>A</span>
              <span>D</span>
              <span>S</span>
              <span>R</span>
            </div>
          </div>

          {/* Preset selector */}
          <div className="flex gap-1 flex-wrap">
            {(["pluck", "pad", "percussion", "swell"] as EnvelopePreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className="px-1.5 py-0.5 bg-[#1a1a1a] hover:bg-[#333] rounded text-[9px] text-gray-400 hover:text-white transition-colors capitalize"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* ADSR sliders */}
          <div className="grid grid-cols-2 gap-2">
            {/* Attack */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Attack</span>
                <span className="text-[9px] text-[#667eea]">{currentEnvelope.attack.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="2"
                step="0.01"
                value={currentEnvelope.attack}
                onChange={(e) => handleParamChange("attack", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Decay */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Decay</span>
                <span className="text-[9px] text-[#667eea]">{currentEnvelope.decay.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={currentEnvelope.decay}
                onChange={(e) => handleParamChange("decay", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Sustain */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Sustain</span>
                <span className="text-[9px] text-[#667eea]">{Math.round(currentEnvelope.sustain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentEnvelope.sustain}
                onChange={(e) => handleParamChange("sustain", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Release */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Release</span>
                <span className="text-[9px] text-[#667eea]">{currentEnvelope.release.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="3"
                step="0.01"
                value={currentEnvelope.release}
                onChange={(e) => handleParamChange("release", parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleParamChange("curve", currentEnvelope.curve === "linear" ? "exponential" : "linear")}
              className="px-1.5 py-0.5 bg-[#1a1a1a] hover:bg-[#333] rounded text-[9px] text-gray-400 transition-colors"
            >
              {currentEnvelope.curve === "exponential" ? "⌒ Exp" : "/ Lin"}
            </button>
            <button
              onClick={() => handleParamChange("loop", !currentEnvelope.loop)}
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                currentEnvelope.loop
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
              }`}
            >
              {currentEnvelope.loop ? "↻ Loop" : "→ Once"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
