"use client";

import React, { useEffect } from "react";
import { Zap, Play, Square, Settings2, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PWMCanvas } from "./PWMCanvas";
import { usePWMStore } from "@/store/pwmStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useSimulationStore } from "@/store/simulationStore";
import { FullscreenWrapper } from "@/components/common/FullscreenGraphWrapper";
import { PWMMode } from "@/lib/signal/pwmGenerator";

interface PWMPanelProps {
  className?: string;
}

export const PWMPanel: React.FC<PWMPanelProps> = ({ className = "" }) => {
  const {
    config,
    enabled,
    signalData,
    metrics,
    showCarrier,
    showModulating,
    showPWM,
    showAverage,
    timeWindow,
    setConfig,
    setEnabled,
    generateSignal,
    generateFromInputSignal,
    setShowCarrier,
    setShowModulating,
    setShowPWM,
    setShowAverage,
    setTimeWindow,
  } = usePWMStore();

  const { original } = useSignalProcessingStore();
  const { settings } = useSimulationStore();
  const sampleRate = settings.signalSampleRate;

  // Auto-generate when enabled or config changes
  useEffect(() => {
    if (enabled) {
      if (config.mode === "custom" && original.length > 0) {
        generateFromInputSignal(original, sampleRate);
      } else {
        generateSignal(0.1, sampleRate * 10); // 100ms at higher sample rate for PWM
      }
    }
  }, [enabled, config, original, sampleRate, generateSignal, generateFromInputSignal]);

  const modeOptions = [
    { value: "fixed", label: "Fixed Duty Cycle" },
    { value: "sine", label: "Sine Modulation" },
    { value: "triangle", label: "Triangle Modulation" },
    { value: "sawtooth", label: "Sawtooth Modulation" },
    { value: "custom", label: "From Signal" },
  ];

  return (
    <div className={`bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#00ff88]" />
          <h3 className="text-sm font-semibold text-white">PWM (ШИМ)</h3>
          <span className="text-xs text-gray-500">Pulse Width Modulation</span>
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
        {/* Mode Selection */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Modulation Mode</label>
          <Select
            value={config.mode}
            onChange={(e) => setConfig({ mode: e.target.value as PWMMode })}
            options={modeOptions}
            className="w-full"
          />
        </div>

        {/* Carrier Frequency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Carrier Frequency</label>
            <span className="text-xs text-[#00ff88] font-mono">{config.carrierFrequency} Hz</span>
          </div>
          <Slider
            min={100}
            max={10000}
            step={100}
            value={config.carrierFrequency}
            onChange={(e) => setConfig({ carrierFrequency: parseFloat(e.target.value) })}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">100 Hz</span>
            <span className="text-[10px] text-gray-500">10 kHz</span>
          </div>
        </div>

        {/* Duty Cycle (for fixed mode) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Base Duty Cycle</label>
            <span className="text-xs text-[#00ff88] font-mono">{(config.dutyCycle * 100).toFixed(0)}%</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={config.dutyCycle}
            onChange={(e) => setConfig({ dutyCycle: parseFloat(e.target.value) })}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">0%</span>
            <span className="text-[10px] text-gray-500">100%</span>
          </div>
        </div>

        {/* Modulation Parameters (only for non-fixed modes) */}
        {config.mode !== "fixed" && config.mode !== "custom" && (
          <>
            {/* Modulation Frequency */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Modulation Frequency</label>
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

            {/* Modulation Depth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Modulation Depth</label>
                <span className="text-xs text-[#f093fb] font-mono">{(config.modulationDepth * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={config.modulationDepth}
                onChange={(e) => setConfig({ modulationDepth: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )}

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
              onClick={() => setShowPWM(!showPWM)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showPWM ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showPWM ? <Eye size={12} /> : <EyeOff size={12} />}
              PWM Signal
            </button>
            <button
              onClick={() => setShowModulating(!showModulating)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showModulating ? "bg-[#f093fb]/20 text-[#f093fb]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showModulating ? <Eye size={12} /> : <EyeOff size={12} />}
              Modulating
            </button>
            <button
              onClick={() => setShowAverage(!showAverage)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showAverage ? "bg-[#feca57]/20 text-[#feca57]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showAverage ? <Eye size={12} /> : <EyeOff size={12} />}
              Average
            </button>
            <button
              onClick={() => setShowCarrier(!showCarrier)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                showCarrier ? "bg-[#54a0ff]/20 text-[#54a0ff]" : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              {showCarrier ? <Eye size={12} /> : <EyeOff size={12} />}
              Duty Level
            </button>
          </div>
        </div>

        {/* PWM Visualization */}
        {enabled && signalData && (
          <div className="pt-2 border-t border-[#2a2a2a]">
            <FullscreenWrapper>
              <div className="h-[200px]">
                <PWMCanvas
                  signalData={signalData}
                  timeWindow={timeWindow}
                  showCarrier={showCarrier}
                  showModulating={showModulating}
                  showPWM={showPWM}
                  showAverage={showAverage}
                />
              </div>
            </FullscreenWrapper>
          </div>
        )}

        {/* Metrics */}
        {enabled && metrics && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Effective Duty</div>
              <div className="text-sm font-mono text-[#00ff88]">
                {(metrics.effectiveDutyCycle * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Ripple</div>
              <div className="text-sm font-mono text-[#feca57]">
                {(metrics.rippleAmplitude * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">THD</div>
              <div className="text-sm font-mono text-[#f093fb]">
                {metrics.thd.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase">Switching</div>
              <div className="text-sm font-mono text-[#54a0ff]">
                {(metrics.switchingLossFactor * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        {!enabled && (
          <div className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <p className="text-xs text-gray-500 text-center">
              Click &quot;Start&quot; to generate PWM signal
            </p>
            <p className="text-[10px] text-gray-600 text-center mt-1">
              ШИМ используется для управления мощностью, яркостью LED, скоростью моторов
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
