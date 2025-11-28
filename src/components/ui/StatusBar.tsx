"use client";

import React from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useRadiusStore } from "@/store/radiusStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";
import { Activity, Zap, Layers, Filter } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { isPlaying, currentTime, settings } = useSimulationStore();
  const { radii } = useRadiusStore();
  const { original, noisy } = useSignalProcessingStore();
  const { isFilterApplied, filterSettings } = useFilterStore();

  const formatTime = (time: number) => {
    return `${time.toFixed(2)}s`;
  };

  const fps = settings.fps || 0;
  const sampleRate = settings.signalSampleRate || 30;
  const bufferSize = original.length;

  return (
    <div className="h-6 bg-[#0f0f0f] border-t border-[#2a2a2a] flex items-center justify-between px-3 text-[10px] text-gray-500 flex-shrink-0">
      {/* Left section - Playback status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className={isPlaying ? "text-green-500" : "text-gray-600"} />
          <span className={isPlaying ? "text-green-400" : "text-gray-600"}>
            {isPlaying ? "Playing" : "Paused"}
          </span>
        </div>

        <div className="h-3 w-px bg-[#2a2a2a]" />

        <span>Time: {formatTime(currentTime)}</span>

        <div className="h-3 w-px bg-[#2a2a2a]" />

        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-blue-500" />
          <span>FPS: {fps}</span>
        </div>
      </div>

      {/* Center section - Signal info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-purple-500" />
          <span>Radii: {radii.length}</span>
        </div>

        <div className="h-3 w-px bg-[#2a2a2a]" />

        <span>Sample Rate: {sampleRate} Hz</span>

        <div className="h-3 w-px bg-[#2a2a2a]" />

        <span>Buffer: {bufferSize} samples</span>
      </div>

      {/* Right section - Filter status */}
      <div className="flex items-center gap-4">
        {isFilterApplied && filterSettings && (
          <>
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-orange-500" />
              <span className="text-orange-400">
                Filter: {filterSettings.type} ({filterSettings.mode})
              </span>
            </div>
            <span>Order: {filterSettings.order}</span>
            <span>Cutoff: {filterSettings.cutoffFreq} Hz</span>
          </>
        )}
        {!isFilterApplied && (
          <span className="text-gray-600">No filter applied</span>
        )}
      </div>
    </div>
  );
};
