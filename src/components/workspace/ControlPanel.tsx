"use client";

import React from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { Button } from "@/components/ui/Button";
import { ExportPanel } from "./ExportPanel";
import { AudioPanel } from "./AudioPanel";
import { PresetPanel } from "./PresetPanel";
import { ProjectPanel } from "./ProjectPanel";
import { TrailLengthControl } from "@/components/settings/TrailLengthControl";

export const ControlPanel: React.FC = () => {
  const { isPlaying, isPaused, currentTime, fps, play, pause, stop, reset, activeTrackingRadiusId } =
    useSimulationStore();

  const handleReset = () => {
    const trackingId = activeTrackingRadiusId;
    reset();
    // Clear signal processing graphs
    useSignalProcessingStore.getState().resetSignal();

    // Restore tracking and trail for selected radius
    if (trackingId) {
      requestAnimationFrame(() => {
        useSimulationStore.getState().setActiveTrackingRadius(trackingId);
        useSimulationStore.getState().toggleTrailTracking(trackingId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-2.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] flex-wrap">
      {/* Playback controls */}
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button
            onClick={play}
            variant="primary"
            size="sm"
            title="Start animation"
          >
            <Play size={16} className="mr-1" />
            {isPaused ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" size="sm" title="Pause">
            <Pause size={16} className="mr-1" />
            Pause
          </Button>
        )}

        <Button
          onClick={stop}
          variant="secondary"
          size="sm"
          title="Stop"
          disabled={!isPlaying && !isPaused}
        >
          <Square size={16} className="mr-1" />
          Stop
        </Button>

        <Button
          onClick={handleReset}
          variant="secondary"
          size="sm"
          title="Reset and clear all"
        >
          <RotateCcw size={16} className="mr-1" />
          Reset
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* Info */}
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">Time:</span>{" "}
          <span className="text-[#667eea] font-semibold">
            {currentTime.toFixed(2)}s
          </span>
        </div>
        <div>
          <span className="text-gray-500">FPS:</span>{" "}
          <span className="text-[#667eea] font-semibold">
            {Math.round(fps)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* Presets */}
      <PresetPanel />

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* ✨ NEW: Projects (Save/Load) */}
      <ProjectPanel />

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* Audio */}
      <AudioPanel />

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* Export */}
      <ExportPanel />

      {/* Divider */}
      <div className="w-px h-8 bg-[#333]" />

      {/* Trail Controls */}
      <div className="flex-1 min-w-[200px]">
        <TrailLengthControl />
      </div>
    </div>
  );
};
