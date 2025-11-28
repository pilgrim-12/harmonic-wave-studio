"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useRadiusStore } from "@/store/radiusStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";
import { Activity, Zap, Layers, Filter, Cpu } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { isPlaying, currentTime, settings, fps } = useSimulationStore();
  const { radii } = useRadiusStore();
  const { original } = useSignalProcessingStore();
  const { isFilterApplied, filterSettings } = useFilterStore();
  const [cpuLoad, setCpuLoad] = useState<number>(0);

  const formatTime = (time: number) => {
    return `${time.toFixed(2)}s`;
  };

  const sampleRate = settings.signalSampleRate || 30;
  const bufferSize = original.length;

  // Estimate computational load based on complexity
  useEffect(() => {
    // Update load periodically to avoid cascading renders
    const interval = setInterval(() => {
      setCpuLoad((prevLoad) => {
        if (!isPlaying) {
          return 0;
        }

        // Calculate load factors (more conservative)
        const radiiFactor = Math.min(radii.length * 3, 25); // 3% per radius, max 25%

        // Only penalize if FPS is significantly below target
        const targetFps = 60;
        const fpsFactor = fps > 0 && fps < targetFps
          ? Math.min((targetFps - fps) * 0.8, 30) // Max 30% from FPS
          : 0;

        const bufferFactor = Math.min(bufferSize / 200, 15); // Reduced buffer impact
        const filterFactor = isFilterApplied ? 10 : 0; // Reduced filter overhead

        const estimatedLoad = Math.min(100, radiiFactor + fpsFactor + bufferFactor + filterFactor);

        // Smooth the changes more gradually
        return Math.round(estimatedLoad * 0.3 + prevLoad * 0.7);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, radii.length, fps, bufferSize, isFilterApplied]);

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

        <div className="h-3 w-px bg-[#2a2a2a]" />

        <div className="flex items-center gap-1.5">
          <Cpu size={12} className={cpuLoad > 80 ? "text-red-500" : cpuLoad > 50 ? "text-yellow-500" : "text-green-500"} />
          <span className={cpuLoad > 80 ? "text-red-400" : cpuLoad > 50 ? "text-yellow-400" : "text-green-400"}>
            Load: {cpuLoad}%
          </span>
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
