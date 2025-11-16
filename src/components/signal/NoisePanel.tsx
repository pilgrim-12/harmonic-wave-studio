"use client";

import React from "react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { NoiseType } from "@/types/signal";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";

const noiseTypes: { value: NoiseType; label: string }[] = [
  { value: "white", label: "White Noise" },
  { value: "pink", label: "Pink Noise (1/f)" },
  { value: "brown", label: "Brown Noise (1/f²)" },
  { value: "gaussian", label: "Gaussian Noise" },
  { value: "impulse", label: "Impulse Noise" },
  { value: "sine", label: "Sine Wave" },
];

export const NoisePanel: React.FC = () => {
  const { noiseConfig, updateNoiseConfig, applyNoise, original } =
    useSignalProcessingStore();

  if (!noiseConfig) return null;

  const handleApplyNoise = () => {
    if (original.length > 0) {
      applyNoise(original, noiseConfig);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Noise Generation</h3>
        <Button
          onClick={handleApplyNoise}
          variant="primary"
          className="text-xs"
          disabled={original.length === 0}
        >
          Apply Noise
        </Button>
      </div>

      {/* Noise Type */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Noise Type</label>
        <Select
          value={noiseConfig.type}
          onChange={(e) =>
            updateNoiseConfig({ type: e.target.value as NoiseType })
          }
          options={noiseTypes}
        />
      </div>

      {/* SNR Control */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-400">
            SNR (Signal-to-Noise Ratio)
          </label>
          <span className="text-xs text-[#667eea] font-mono">
            {noiseConfig.snr.toFixed(1)} dB
          </span>
        </div>
        <Slider
          value={noiseConfig.snr}
          onChange={(e) =>
            updateNoiseConfig({ snr: parseFloat(e.target.value) })
          }
          min={0}
          max={60}
          step={1}
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>0 dB (High noise)</span>
          <span>60 dB (Low noise)</span>
        </div>
      </div>

      {/* Amplitude Control */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-400">Amplitude</label>
          <span className="text-xs text-[#667eea] font-mono">
            {(noiseConfig.amplitude * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={noiseConfig.amplitude}
          onChange={(e) =>
            updateNoiseConfig({ amplitude: parseFloat(e.target.value) })
          }
          min={0}
          max={1}
          step={0.01}
        />
      </div>

      {/* Frequency (for sine wave) */}
      {noiseConfig.type === "sine" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-400">Frequency</label>
            <span className="text-xs text-[#667eea] font-mono">
              {noiseConfig.frequency?.toFixed(1) || 5} Hz
            </span>
          </div>
          <Slider
            value={noiseConfig.frequency || 5}
            onChange={(e) =>
              updateNoiseConfig({ frequency: parseFloat(e.target.value) })
            }
            min={0.1}
            max={20}
            step={0.1}
          />
        </div>
      )}

      {/* Info */}
      <div className="text-[10px] text-gray-500 bg-[#0f0f0f] p-2 rounded">
        <p className="mb-1">
          <strong className="text-gray-400">Selected:</strong>{" "}
          {noiseTypes.find((n) => n.value === noiseConfig.type)?.label}
        </p>
        {noiseConfig.type === "white" && <p>Uniform frequency spectrum</p>}
        {noiseConfig.type === "pink" && <p>Equal energy per octave (1/f)</p>}
        {noiseConfig.type === "brown" && (
          <p>More low frequency content (1/f²)</p>
        )}
        {noiseConfig.type === "gaussian" && (
          <p>Normal distribution around zero</p>
        )}
        {noiseConfig.type === "impulse" && <p>Random spikes (salt & pepper)</p>}
        {noiseConfig.type === "sine" && <p>Periodic interference signal</p>}
      </div>
    </div>
  );
};
