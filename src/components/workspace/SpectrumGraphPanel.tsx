"use client";

import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { analyzeSignal } from "@/lib/fourier/analyzer";
import { FFTAnalysisResult } from "@/types/fourier";
import { SpectrumCanvas } from "@/components/analysis/SpectrumCanvas";

export const SpectrumGraphPanel: React.FC = () => {
  const signalBuffer = useSignalProcessingStore((state) => state.signalBuffer);
  const { isPlaying } = useSimulationStore();
  const [analysisResult, setAnalysisResult] = useState<FFTAnalysisResult | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  /**
   * Clear spectrum when signal is reset
   */
  useEffect(() => {
    if (signalBuffer.length === 0) {
      setAnalysisResult(null);
      setUpdateCounter(0);
    }
  }, [signalBuffer.length]);

  /**
   * Perform FFT analysis on signal data
   */
  const performFFT = () => {
    const currentBuffer = useSignalProcessingStore.getState().signalBuffer;

    if (currentBuffer.length < 100) {
      return;
    }

    const yValues = currentBuffer.map((point) => point.y);
    const sampleRate = useSimulationStore.getState().settings.signalSampleRate || 60;

    try {
      const result = analyzeSignal(yValues, sampleRate, {
        threshold: 0.05,
        minFrequency: 0.1,
        maxFrequency: sampleRate / 2,
        maxPeaks: 20,
        minPeakDistance: 0.2,
      });

      setAnalysisResult({ ...result });
      setUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("FFT Analysis Error:", error);
    }
  };

  /**
   * Real-time FFT update
   */
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    // Update FFT every 500ms
    const interval = setInterval(() => {
      const buffer = useSignalProcessingStore.getState().signalBuffer;
      if (buffer.length >= 100) {
        performFFT();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-bold text-[#667eea]">Frequency Spectrum</h3>
        </div>
        {isPlaying && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      {/* Spectrum Canvas */}
      {analysisResult ? (
        <div className="flex-1 min-h-0">
          <SpectrumCanvas
            key={updateCounter}
            spectrum={analysisResult.spectrum}
            maxFrequency={10}
            height={0}
            showGrid={true}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Waiting for signal data...</p>
            <p className="text-xs mt-1">Start the animation to see the spectrum</p>
          </div>
        </div>
      )}
    </div>
  );
};
