"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  TimelineConfig,
  KeyframeTrack,
  Keyframe,
  KeyframeTarget,
  KeyframeEasing,
  DEFAULT_TIMELINE,
  createKeyframe,
  createKeyframeTrack,
} from "@/types/radius";
import { Tooltip } from "@/components/ui/Tooltip";
import { Clock, Plus, Trash2, X } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

interface TimelineEditorProps {
  timeline?: TimelineConfig;
  onChange: (timeline: TimelineConfig) => void;
  baseAmplitude: number;
  baseFrequency: number;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  timeline,
  onChange,
  baseAmplitude,
  baseFrequency,
}) => {
  const currentTimeline = timeline || DEFAULT_TIMELINE;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<KeyframeTarget | null>(null);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const currentTime = useSimulationStore((s) => s.currentTime);

  const handleToggleEnabled = () => {
    onChange({
      ...currentTimeline,
      enabled: !currentTimeline.enabled,
    });
  };

  const handleDurationChange = (duration: number) => {
    onChange({
      ...currentTimeline,
      duration: Math.max(1, duration),
    });
  };

  const handleToggleLoop = () => {
    onChange({
      ...currentTimeline,
      loop: !currentTimeline.loop,
    });
  };

  const addTrack = (target: KeyframeTarget) => {
    // Check if track already exists
    if (currentTimeline.tracks.some((t) => t.target === target)) {
      return;
    }

    const newTrack = createKeyframeTrack(target);
    // Add default keyframes at start and end
    const startValue = target === "amplitude" ? baseAmplitude : target === "frequency" ? baseFrequency : 0;
    newTrack.keyframes = [
      createKeyframe(0, startValue, "linear"),
      createKeyframe(currentTimeline.duration, startValue, "linear"),
    ];

    onChange({
      ...currentTimeline,
      tracks: [...currentTimeline.tracks, newTrack],
    });
    setSelectedTrack(target);
  };

  const removeTrack = (target: KeyframeTarget) => {
    onChange({
      ...currentTimeline,
      tracks: currentTimeline.tracks.filter((t) => t.target !== target),
    });
    if (selectedTrack === target) {
      setSelectedTrack(null);
    }
  };

  const getTrack = (target: KeyframeTarget): KeyframeTrack | undefined => {
    return currentTimeline.tracks.find((t) => t.target === target);
  };

  const addKeyframe = (target: KeyframeTarget, time: number) => {
    const track = getTrack(target);
    if (!track) return;

    // Get value at this time (interpolated from existing keyframes)
    const defaultValue = target === "amplitude" ? baseAmplitude : target === "frequency" ? baseFrequency : 0;
    const newKeyframe = createKeyframe(time, defaultValue, "linear");

    const updatedTrack: KeyframeTrack = {
      ...track,
      keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
    };

    onChange({
      ...currentTimeline,
      tracks: currentTimeline.tracks.map((t) => (t.target === target ? updatedTrack : t)),
    });
    setSelectedKeyframeId(newKeyframe.id);
  };

  const updateKeyframe = (target: KeyframeTarget, keyframeId: string, updates: Partial<Keyframe>) => {
    const track = getTrack(target);
    if (!track) return;

    const updatedTrack: KeyframeTrack = {
      ...track,
      keyframes: track.keyframes
        .map((kf) => (kf.id === keyframeId ? { ...kf, ...updates } : kf))
        .sort((a, b) => a.time - b.time),
    };

    onChange({
      ...currentTimeline,
      tracks: currentTimeline.tracks.map((t) => (t.target === target ? updatedTrack : t)),
    });
  };

  const removeKeyframe = (target: KeyframeTarget, keyframeId: string) => {
    const track = getTrack(target);
    if (!track) return;

    // Don't remove if only 2 keyframes left
    if (track.keyframes.length <= 2) return;

    const updatedTrack: KeyframeTrack = {
      ...track,
      keyframes: track.keyframes.filter((kf) => kf.id !== keyframeId),
    };

    onChange({
      ...currentTimeline,
      tracks: currentTimeline.tracks.map((t) => (t.target === target ? updatedTrack : t)),
    });

    if (selectedKeyframeId === keyframeId) {
      setSelectedKeyframeId(null);
    }
  };

  const selectedKeyframe = useMemo(() => {
    if (!selectedTrack || !selectedKeyframeId) return null;
    const track = getTrack(selectedTrack);
    return track?.keyframes.find((kf) => kf.id === selectedKeyframeId) || null;
  }, [selectedTrack, selectedKeyframeId, currentTimeline.tracks]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedTrack) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / rect.width) * currentTimeline.duration;

      // Check if clicking near existing keyframe
      const track = getTrack(selectedTrack);
      if (!track) return;

      const clickedKeyframe = track.keyframes.find((kf) => {
        const kfX = (kf.time / currentTimeline.duration) * rect.width;
        return Math.abs(x - kfX) < 10;
      });

      if (clickedKeyframe) {
        setSelectedKeyframeId(clickedKeyframe.id);
      } else {
        // Add new keyframe at clicked position
        addKeyframe(selectedTrack, Math.max(0, Math.min(time, currentTimeline.duration)));
      }
    },
    [selectedTrack, currentTimeline.duration]
  );

  // Draw timeline canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw current time indicator
    const timeX = ((currentTime % currentTimeline.duration) / currentTimeline.duration) * width;
    ctx.strokeStyle = "#FF9800";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(timeX, 0);
    ctx.lineTo(timeX, height);
    ctx.stroke();

    // Draw tracks
    const trackHeight = height / 3;
    const targets: KeyframeTarget[] = ["amplitude", "frequency", "phase"];
    const colors: Record<KeyframeTarget, string> = {
      amplitude: "#667eea",
      frequency: "#f093fb",
      phase: "#43e97b",
    };

    targets.forEach((target, trackIndex) => {
      const track = getTrack(target);
      const y = trackIndex * trackHeight + trackHeight / 2;

      // Track label
      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      ctx.fillText(target.substring(0, 3).toUpperCase(), 4, y + 3);

      if (!track || track.keyframes.length === 0) return;

      // Draw keyframe line
      ctx.strokeStyle = colors[target];
      ctx.lineWidth = selectedTrack === target ? 2 : 1;
      ctx.beginPath();

      const sortedKfs = [...track.keyframes].sort((a, b) => a.time - b.time);
      sortedKfs.forEach((kf, i) => {
        const x = (kf.time / currentTimeline.duration) * width;
        // Normalize value for display
        let normalizedY: number;
        if (target === "amplitude") {
          normalizedY = y - ((kf.value / 200) * trackHeight) / 2;
        } else if (target === "frequency") {
          normalizedY = y - ((kf.value / 10) * trackHeight) / 2;
        } else {
          normalizedY = y - ((kf.value / 360) * trackHeight) / 2;
        }

        if (i === 0) {
          ctx.moveTo(x, normalizedY);
        } else {
          ctx.lineTo(x, normalizedY);
        }
      });
      ctx.stroke();

      // Draw keyframe points
      sortedKfs.forEach((kf) => {
        const x = (kf.time / currentTimeline.duration) * width;
        let normalizedY: number;
        if (target === "amplitude") {
          normalizedY = y - ((kf.value / 200) * trackHeight) / 2;
        } else if (target === "frequency") {
          normalizedY = y - ((kf.value / 10) * trackHeight) / 2;
        } else {
          normalizedY = y - ((kf.value / 360) * trackHeight) / 2;
        }

        ctx.fillStyle = selectedKeyframeId === kf.id ? "#fff" : colors[target];
        ctx.beginPath();
        ctx.arc(x, normalizedY, selectedKeyframeId === kf.id ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }, [currentTimeline, currentTime, selectedTrack, selectedKeyframeId]);

  const availableTargets: KeyframeTarget[] = ["amplitude", "frequency", "phase"];
  const existingTargets = currentTimeline.tracks.map((t) => t.target);
  const missingTargets = availableTargets.filter((t) => !existingTargets.includes(t));

  return (
    <div className="space-y-2 pt-1">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Tooltip
          content={
            <div className="max-w-xs">
              <div className="font-semibold mb-0.5">Timeline Keyframes</div>
              <div className="text-[10px] text-gray-300">
                Animate parameters over time with keyframes. Click canvas to add/select keyframes.
              </div>
            </div>
          }
          className="!whitespace-normal !w-48"
        >
          <label className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-600 flex items-center gap-1">
            <Clock size={10} />
            Timeline
          </label>
        </Tooltip>
        <button
          onClick={handleToggleEnabled}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            currentTimeline.enabled
              ? "bg-green-500/20 text-green-400"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
          }`}
        >
          {currentTimeline.enabled ? "ON" : "OFF"}
        </button>
      </div>

      {currentTimeline.enabled && (
        <>
          {/* Duration and loop controls */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Duration</span>
                <span className="text-[9px] text-[#667eea]">{currentTimeline.duration}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={currentTimeline.duration}
                onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
            <button
              onClick={handleToggleLoop}
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                currentTimeline.loop
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
              }`}
            >
              {currentTimeline.loop ? "↻ Loop" : "→ Once"}
            </button>
          </div>

          {/* Add track buttons */}
          {missingTargets.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {missingTargets.map((target) => (
                <button
                  key={target}
                  onClick={() => addTrack(target)}
                  className="px-1.5 py-0.5 bg-[#1a1a1a] hover:bg-[#333] rounded text-[9px] text-gray-400 hover:text-white transition-colors flex items-center gap-0.5"
                >
                  <Plus size={8} />
                  {target}
                </button>
              ))}
            </div>
          )}

          {/* Track selector */}
          {currentTimeline.tracks.length > 0 && (
            <div className="flex gap-1">
              {currentTimeline.tracks.map((track) => (
                <div key={track.target} className="flex items-center">
                  <button
                    onClick={() => setSelectedTrack(selectedTrack === track.target ? null : track.target)}
                    className={`px-1.5 py-0.5 rounded-l text-[9px] transition-colors ${
                      selectedTrack === track.target
                        ? track.target === "amplitude"
                          ? "bg-[#667eea]/20 text-[#667eea]"
                          : track.target === "frequency"
                          ? "bg-[#f093fb]/20 text-[#f093fb]"
                          : "bg-[#43e97b]/20 text-[#43e97b]"
                        : "bg-[#1a1a1a] text-gray-400 hover:bg-[#333]"
                    }`}
                  >
                    {track.target}
                  </button>
                  <button
                    onClick={() => removeTrack(track.target)}
                    className="px-1 py-0.5 bg-[#1a1a1a] hover:bg-red-500/20 rounded-r text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Timeline canvas */}
          <div className="bg-[#0a0a0a] rounded border border-[#333] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={200}
              height={60}
              className="w-full h-[60px] cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>

          {/* Keyframe editor */}
          {selectedKeyframe && selectedTrack && (
            <div className="bg-[#1a1a1a] rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-400">Keyframe</span>
                <button
                  onClick={() => removeKeyframe(selectedTrack, selectedKeyframe.id)}
                  className="p-0.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Time */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500">Time</span>
                  <span className="text-[9px] text-[#667eea]">{selectedKeyframe.time.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentTimeline.duration}
                  step="0.1"
                  value={selectedKeyframe.time}
                  onChange={(e) =>
                    updateKeyframe(selectedTrack, selectedKeyframe.id, { time: parseFloat(e.target.value) })
                  }
                  className="w-full h-1 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                    [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Value */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500">Value</span>
                  <span className="text-[9px] text-[#667eea]">
                    {selectedKeyframe.value.toFixed(1)}
                    {selectedTrack === "phase" ? "°" : selectedTrack === "frequency" ? " Hz" : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedTrack === "phase" ? -180 : 0}
                  max={selectedTrack === "amplitude" ? 500 : selectedTrack === "frequency" ? 20 : 180}
                  step={selectedTrack === "phase" ? 1 : 0.1}
                  value={selectedKeyframe.value}
                  onChange={(e) =>
                    updateKeyframe(selectedTrack, selectedKeyframe.id, { value: parseFloat(e.target.value) })
                  }
                  className="w-full h-1 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                    [&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Easing */}
              <div className="flex gap-1 flex-wrap">
                {(["linear", "ease-in", "ease-out", "ease-in-out", "step"] as KeyframeEasing[]).map((easing) => (
                  <button
                    key={easing}
                    onClick={() => updateKeyframe(selectedTrack, selectedKeyframe.id, { easing })}
                    className={`px-1 py-0.5 rounded text-[8px] transition-colors ${
                      selectedKeyframe.easing === easing
                        ? "bg-[#667eea]/20 text-[#667eea]"
                        : "bg-[#0a0a0a] text-gray-400 hover:bg-[#333]"
                    }`}
                  >
                    {easing}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
