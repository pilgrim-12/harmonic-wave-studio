"use client";

import React from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/Button";

export const ControlPanel: React.FC = () => {
  const { isPlaying, isPaused, currentTime, fps, play, pause, stop, reset } =
    useSimulationStore();

  return (
    <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
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

        <Button onClick={reset} variant="secondary" size="sm" title="Reset">
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
    </div>
  );
};
