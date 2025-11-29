"use client";

import React, { useState, useCallback } from "react";
import { X, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  exportCanvasGIF,
  downloadGIF,
  GifExportProgress,
} from "@/lib/export/gifExporter";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

interface GifExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GifExportModal: React.FC<GifExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<GifExportProgress | null>(null);

  const { play, stop, reset, activeTrackingRadiusId } = useSimulationStore();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setProgress({ phase: "capturing", progress: 0 });

    try {
      const trackingId = activeTrackingRadiusId;

      const blob = await exportCanvasGIF(
        () => document.querySelector("canvas#main-canvas") as HTMLCanvasElement,
        () => play(),
        () => stop(),
        () => {
          reset();
          useSignalProcessingStore.getState().resetSignal();
          // Restore tracking if was set
          if (trackingId) {
            requestAnimationFrame(() => {
              useSimulationStore.getState().setActiveTrackingRadius(trackingId);
              useSimulationStore.getState().toggleTrailTracking(trackingId);
            });
          }
        },
        { duration, fps, quality },
        setProgress
      );

      downloadGIF(blob);
      onClose();
    } catch (error) {
      console.error("GIF export failed:", error);
      alert(`Failed to export GIF: ${error}`);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [duration, fps, quality, play, stop, reset, activeTrackingRadiusId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] w-[400px] max-w-[95vw] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-purple-400" />
            <h2 className="text-white font-medium">Export GIF Animation</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Duration (seconds)
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isExporting}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1s</span>
              <span className="text-purple-400 font-medium">{duration}s</span>
              <span>10s</span>
            </div>
          </div>

          {/* FPS */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Frame Rate (FPS)
            </label>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((f) => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  disabled={isExporting}
                  className={`flex-1 py-1.5 px-2 rounded text-sm transition-colors ${
                    fps === f
                      ? "bg-purple-600 text-white"
                      : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
                  } disabled:opacity-50`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Quality (lower = better)
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={isExporting}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Best (slow)</span>
              <span className="text-purple-400 font-medium">{quality}</span>
              <span>Fast (low)</span>
            </div>
          </div>

          {/* Estimate */}
          <div className="bg-[#252525] rounded-lg p-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Total frames:</span>
              <span className="text-white">{Math.ceil(duration * fps)}</span>
            </div>
            <div className="flex justify-between text-gray-400 mt-1">
              <span>Estimated file size:</span>
              <span className="text-white">
                ~{Math.round((duration * fps * 50) / 1024)} KB - {Math.round((duration * fps * 150) / 1024)} KB
              </span>
            </div>
          </div>

          {/* Progress */}
          {isExporting && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {progress.phase === "capturing"
                    ? "Capturing frames..."
                    : "Rendering GIF..."}
                </span>
                <span className="text-purple-400">{progress.progress}%</span>
              </div>
              <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-200"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#333]">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="primary"
            size="sm"
            disabled={isExporting}
            className="min-w-[100px]"
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                Exporting...
              </>
            ) : (
              <>
                <Film size={14} className="mr-1" />
                Export GIF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
