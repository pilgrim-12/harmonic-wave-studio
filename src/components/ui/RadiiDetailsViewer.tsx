"use client";

import React from "react";
import { EnvelopeConfig, SweepConfig, LFOConfig, TimelineConfig } from "@/types/radius";

/**
 * Unified radius data interface for viewing details
 * Supports both preset format and project format
 */
export interface UnifiedRadiusData {
  // Core parameters (required)
  amplitude: number;      // length/amplitude
  frequency: number;      // rotationSpeed/frequency (can be negative for CW)
  phase: number;          // initialAngle/phase in DEGREES
  color: string;

  // Optional modulation (from presets)
  envelope?: EnvelopeConfig;
  sweep?: SweepConfig;
  lfo?: LFOConfig;
  timeline?: TimelineConfig;
}

interface RadiiDetailsViewerProps {
  radii: UnifiedRadiusData[];
  maxHeight?: string;
  compact?: boolean;
  showModulation?: boolean;
}

/**
 * Unified component for viewing radii details
 * Used in: Presets, Gallery projects, User projects
 */
export const RadiiDetailsViewer: React.FC<RadiiDetailsViewerProps> = ({
  radii,
  maxHeight = "200px",
  compact = false,
  showModulation = true,
}) => {
  if (radii.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic">No radii data</div>
    );
  }

  return (
    <div
      className="space-y-2 overflow-y-auto custom-scrollbar"
      style={{ maxHeight }}
    >
      {radii.map((r, idx) => {
        const hasModulation = showModulation && (r.envelope?.enabled || r.sweep?.enabled || r.lfo?.enabled || r.timeline?.enabled);
        const direction = r.frequency >= 0 ? "CCW" : "CW";
        const absFrequency = Math.abs(r.frequency);

        return (
          <div
            key={idx}
            className={`bg-[#1a1a1a] rounded ${compact ? "p-1.5" : "p-2"} border border-[#333]`}
          >
            {/* Header: color dot, name, modulation badge */}
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 flex-shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <span className={`font-medium text-gray-300 ${compact ? "text-[10px]" : "text-xs"}`}>
                Radius {idx + 1}
              </span>
              {hasModulation && (
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                  MOD
                </span>
              )}
            </div>

            {/* Parameters grid */}
            <div className={`grid grid-cols-4 gap-1 ${compact ? "text-[9px]" : "text-[10px]"} text-gray-500`}>
              <div>
                <span className="text-gray-600">Amp:</span>{" "}
                <span className="text-gray-400">{r.amplitude}</span>
              </div>
              <div>
                <span className="text-gray-600">Freq:</span>{" "}
                <span className="text-gray-400">{absFrequency}</span>
              </div>
              <div>
                <span className="text-gray-600">Phase:</span>{" "}
                <span className="text-gray-400">{Math.round(r.phase)}°</span>
              </div>
              <div>
                <span className="text-gray-600">Dir:</span>{" "}
                <span className="text-gray-400">{direction}</span>
              </div>
            </div>

            {/* Modulation details */}
            {hasModulation && showModulation && (
              <div className="mt-1.5 pt-1.5 border-t border-[#333] text-[10px]">
                <div className="flex flex-wrap gap-1.5">
                  {r.envelope?.enabled && (
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded">
                      ENV: A{r.envelope.attack}s D{r.envelope.decay}s S{r.envelope.sustain} R{r.envelope.release}s
                    </span>
                  )}
                  {r.sweep?.enabled && (
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                      SWEEP: {r.sweep.startFreq}→{r.sweep.endFreq}Hz/{r.sweep.duration}s
                    </span>
                  )}
                  {r.lfo?.enabled && (
                    <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                      LFO: {r.lfo.waveform} {r.lfo.rate}Hz {Math.round(r.lfo.depth * 100)}% → {r.lfo.target}
                    </span>
                  )}
                  {r.timeline?.enabled && (
                    <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
                      TIMELINE: {r.timeline.tracks.length} tracks
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ========================================
// CONVERSION HELPERS
// ========================================

import { PresetRadiusData } from "@/lib/presets/waveforms";
import { Radius as ProjectRadius } from "@/services/projectService";

/**
 * Convert preset radii to unified format
 */
export function presetRadiiToUnified(radii: PresetRadiusData[]): UnifiedRadiusData[] {
  return radii.map((r) => ({
    amplitude: r.length,
    frequency: r.direction === "clockwise" ? -r.rotationSpeed : r.rotationSpeed,
    phase: r.initialAngle, // Already in degrees
    color: r.color,
    envelope: r.envelope,
    sweep: r.sweep,
    lfo: r.lfo,
    timeline: r.timeline,
  }));
}

/**
 * Convert project radii to unified format
 * Note: Project radii store phase in radians
 */
export function projectRadiiToUnified(radii: ProjectRadius[]): UnifiedRadiusData[] {
  return radii.map((r) => ({
    amplitude: r.amplitude,
    frequency: r.frequency,
    phase: (r.phase * 180) / Math.PI, // Convert radians to degrees
    color: r.color || "#667eea",
    // Include modulation parameters if they exist
    envelope: r.envelope,
    sweep: r.sweep,
    lfo: r.lfo,
    timeline: r.timeline,
  }));
}

/**
 * Convert store radii (from radiusStore) to unified format
 */
export function storeRadiiToUnified(radii: Array<{
  length: number;
  rotationSpeed: number;
  initialAngle: number; // radians
  direction: "clockwise" | "counterclockwise";
  color: string;
  envelope?: EnvelopeConfig;
  sweep?: SweepConfig;
  lfo?: LFOConfig;
  timeline?: TimelineConfig;
}>): UnifiedRadiusData[] {
  return radii.map((r) => ({
    amplitude: r.length,
    frequency: r.direction === "clockwise" ? -r.rotationSpeed : r.rotationSpeed,
    phase: (r.initialAngle * 180) / Math.PI, // Convert radians to degrees
    color: r.color,
    envelope: r.envelope,
    sweep: r.sweep,
    lfo: r.lfo,
    timeline: r.timeline,
  }));
}
