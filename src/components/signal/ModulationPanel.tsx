"use client";

import React, { useEffect } from "react";
import { Radio, Play, Square, Settings2, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ModulationCanvas } from "./ModulationCanvas";
import { useModulationStore } from "@/store/modulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useSimulationStore } from "@/store/simulationStore";
import { FullscreenWrapper } from "@/components/common/FullscreenGraphWrapper";
import { ModulationType, getModulationDescription } from "@/lib/signal/modulation";

interface ModulationPanelProps {
  className?: string;
}

export const ModulationPanel: React.FC<ModulationPanelProps> = ({ className = "" }) => {
  const {
    config,
    enabled,
    signalData,
    metrics,
    showCarrier,
    showModulating,
    showModulated,
    showEnvelope,
    showInstantFreq,
    timeWindow,
    setConfig,
    setEnabled,
    generateSignal,
    modulateFromInput,
    setShowCarrier,
    setShowModulating,
    setShowModulated,
    setShowEnvelope,
    setShowInstantFreq,
    setTimeWindow,
  } = useModulationStore();

  const { original } = useSignalProcessingStore();
  const { settings } = useSimulationStore();
  const sampleRate = settings.signalSampleRate;

  // Auto-generate when enabled or config changes
  useEffect(() => {
    if (enabled) {
      if (config.modulationWaveform === "custom" && original.length > 0) {
        // Use epicycle signal as modulating input
        modulateFromInput(original, sampleRate);
      } else {
        // Generate standalone modulation demo
        generateSignal(0.1, sampleRate * 10); // 100ms at higher sample rate
      }
    }
  }, [enabled, config, sampleRate, generateSignal, modulateFromInput, original]);

  // Re-generate when epicycle signal updates (for custom mode)
  useEffect(() => {
    if (enabled && config.modulationWaveform === "custom" && original.length > 0) {
      modulateFromInput(original, sampleRate);
    }
  }, [original, enabled, config.modulationWaveform, sampleRate, modulateFromInput]);

  const modulationTypeOptions = [
    { value: "AM", label: "AM - Amplitude Modulation" },
    { value: "DSB", label: "DSB - Double Sideband (Suppressed Carrier)" },
    { value: "SSB", label: "SSB - Single Sideband" },
    { value: "FM", label: "FM - Frequency Modulation" },
    { value: "PM", label: "PM - Phase Modulation" },
  ];

  const waveformOptions = [
    { value: "sine", label: "Sine Wave" },
    { value: "square", label: "Square Wave" },
    { value: "triangle", label: "Triangle Wave" },
    { value: "sawtooth", label: "Sawtooth Wave" },
    { value: "custom", label: "From Epicycle Signal" },
  ];

  const ssbModeOptions = [
    { value: "upper", label: "Upper Sideband (USB)" },
    { value: "lower", label: "Lower Sideband (LSB)" },
  ];

  const isAngleModulation = config.type === "FM" || config.type === "PM";

  return (
    <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-[#f093fb]" />
          <h3 className="text-sm font-semibold text-white">Modulation</h3>
          <span className="text-xs text-gray-500">AM/FM Signal Modulation</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={enabled ? "primary" : "secondary"}
            size="sm"
            onClick={() => setEnabled(!enabled)}
            className="text-xs"
          >
            {enabled ? <Square size={12} className="mr-1" /> : <Play size={12} className="mr-1" />}
            {enabled ? "Stop" : "Start"}
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Modulation Type */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Modulation Type</label>
          <Select
            value={config.type}
            onChange={(e) => setConfig({ type: e.target.value as ModulationType })}
            options={modulationTypeOptions}
            className="w-full"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            {getModulationDescription(config.type)}
          </p>
        </div>

        {/* SSB Mode (only for SSB) */}
        {config.type === "SSB" && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sideband Mode</label>
            <Select
              value={config.ssbMode || "upper"}
              onChange={(e) => setConfig({ ssbMode: e.target.value as "upper" | "lower" })}
              options={ssbModeOptions}
              className="w-full"
            />
          </div>
        )}

        {/* Carrier Frequency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Carrier Frequency</label>
            <span className="text-xs text-[#54a0ff] font-mono">{config.carrierFrequency} Hz</span>
          </div>
          <Slider
            min={100}
            max={5000}
            step={50}
            value={config.carrierFrequency}
            onChange={(e) => setConfig({ carrierFrequency: parseFloat(e.target.value) })}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">100 Hz</span>
            <span className="text-[10px] text-gray-500">5 kHz</span>
          </div>
        </div>

        {/* Modulating Signal */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Message Signal</label>
          <Select
            value={config.modulationWaveform}
            onChange={(e) => setConfig({ modulationWaveform: e.target.value as "sine" | "square" | "triangle" | "sawtooth" | "custom" })}
            options={waveformOptions}
            className="w-full"
          />
        </div>

        {/* Modulation Frequency (only for non-custom) */}
        {config.modulationWaveform !== "custom" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Message Frequency</label>
              <span className="text-xs text-[#f093fb] font-mono">{config.modulationFrequency} Hz</span>
            </div>
            <Slider
              min={1}
              max={500}
              step={1}
              value={config.modulationFrequency}
              onChange={(e) => setConfig({ modulationFrequency: parseFloat(e.target.value) })}
            />
          </div>
        )}

        {/* Modulation Index/Depth */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">
              {isAngleModulation ? "Modulation Index (β)" : "Modulation Depth"}
            </label>
            <span className="text-xs text-[#feca57] font-mono">
              {isAngleModulation
                ? config.modulationIndex.toFixed(2)
                : `${(config.modulationIndex * 100).toFixed(0)}%`}
            </span>
          </div>
          <Slider
            min={isAngleModulation ? 0.1 : 0}
            max={isAngleModulation ? 10 : 1}
            step={isAngleModulation ? 0.1 : 0.01}
            value={config.modulationIndex}
            onChange={(e) => setConfig({ modulationIndex: parseFloat(e.target.value) })}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">{isAngleModulation ? "0.1" : "0%"}</span>
            <span className="text-[10px] text-gray-500">{isAngleModulation ? "10" : "100%"}</span>
          </div>
        </div>

        {/* Time Window */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Time Window</label>
            <span className="text-xs text-gray-400 font-mono">{(timeWindow * 1000).toFixed(0)} ms</span>
          </div>
          <Slider
            min={0.005}
            max={0.1}
            step={0.005}
            value={timeWindow}
            onChange={(e) => setTimeWindow(parseFloat(e.target.value))}
          />
        </div>

        {/* Visualization Toggles */}
        <div className="pt-2 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-1 mb-2">
            <Settings2 size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400">Display</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowModulated(!showModulated)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showModulated ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showModulated ? <Eye size={12} /> : <EyeOff size={12} />}
              Modulated
            </button>
            <button
              onClick={() => setShowModulating(!showModulating)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showModulating ? "bg-[#f093fb]/20 text-[#f093fb]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showModulating ? <Eye size={12} /> : <EyeOff size={12} />}
              Message
            </button>
            <button
              onClick={() => setShowCarrier(!showCarrier)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showCarrier ? "bg-[#54a0ff]/20 text-[#54a0ff]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showCarrier ? <Eye size={12} /> : <EyeOff size={12} />}
              Carrier
            </button>
            {!isAngleModulation && (
              <button
                onClick={() => setShowEnvelope(!showEnvelope)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                  showEnvelope ? "bg-[#feca57]/20 text-[#feca57]" : "bg-[#1a1a1a] text-gray-500"
                }`}
              >
                {showEnvelope ? <Eye size={12} /> : <EyeOff size={12} />}
                Envelope
              </button>
            )}
            {isAngleModulation && (
              <button
                onClick={() => setShowInstantFreq(!showInstantFreq)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                  showInstantFreq ? "bg-[#ff6b6b]/20 text-[#ff6b6b]" : "bg-[#1a1a1a] text-gray-500"
                }`}
              >
                {showInstantFreq ? <Eye size={12} /> : <EyeOff size={12} />}
                Inst. Freq
              </button>
            )}
          </div>
        </div>

        {/* Signal Visualization */}
        {enabled && signalData && (
          <div className="pt-2 border-t border-[#2a2a2a]">
            <FullscreenWrapper>
              <div className="h-[200px]">
                <ModulationCanvas
                  signalData={signalData}
                  timeWindow={timeWindow}
                  showCarrier={showCarrier}
                  showModulating={showModulating}
                  showModulated={showModulated}
                  showEnvelope={showEnvelope}
                  showInstantFreq={showInstantFreq}
                />
              </div>
            </FullscreenWrapper>
          </div>
        )}

        {/* Metrics */}
        {enabled && metrics && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Mod Depth</div>
              <div className="text-sm font-mono text-[#f093fb]">
                {metrics.modulationDepth.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Bandwidth</div>
              <div className="text-sm font-mono text-[#54a0ff]">
                {metrics.bandwidth.toFixed(0)} Hz
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Efficiency</div>
              <div className="text-sm font-mono text-[#00ff88]">
                {metrics.efficiency.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">
                {isAngleModulation ? "Peak Dev" : "Sideband Pwr"}
              </div>
              <div className="text-sm font-mono text-[#feca57]">
                {isAngleModulation
                  ? `${metrics.peakDeviation?.toFixed(0) || 0} Hz`
                  : metrics.sidebandPower.toFixed(3)}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        {!enabled && (
          <div className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <p className="text-xs text-gray-500 text-center">
              Click &quot;Start&quot; to generate modulated signal
            </p>
            <p className="text-[10px] text-gray-600 text-center mt-1">
              Modulation encodes information onto a carrier wave. Use &quot;From Epicycle Signal&quot; to modulate with the epicycle output.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
