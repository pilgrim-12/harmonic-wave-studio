"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore"; // ⭐ NEW
import { analyzeSignal } from "@/lib/fourier/analyzer";
import { generateRadiiFromFFT } from "@/lib/fourier/epicycleGenerator";
import { useRadiusStore } from "@/store/radiusStore";
import { FFTAnalysisResult } from "@/types/fourier";
import { SpectrumCanvas } from "./SpectrumCanvas";
import {
  GenerationSettingsDialog,
  GenerationSettings,
} from "./GenerationSettingsDialog";

export const FrequencyPanel: React.FC = () => {
  // ⭐ CHANGED: Read from signalProcessingStore instead of simulationStore
  const signalBuffer = useSignalProcessingStore((state) => state.signalBuffer);
  const { isPlaying } = useSimulationStore(); // ⭐ NEW - для real-time FFT
  const { clearRadii, addRadius, selectRadius } = useRadiusStore();
  const { setActiveTrackingRadius } = useSimulationStore();

  const [analysisResult, setAnalysisResult] =
    useState<FFTAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [realTimeFft, setRealTimeFft] = useState(false); // ⭐ NEW
  const [updateCounter, setUpdateCounter] = useState(0); // ⭐ Force re-render
  const [showFloatingSpectrum, setShowFloatingSpectrum] = useState(false); // ⭐ Floating panel

  /**
   * Perform FFT analysis on signal data
   */
  const performFFT = () => {
    // ⭐ Always get fresh data from store
    const currentBuffer = useSignalProcessingStore.getState().signalBuffer;

    if (currentBuffer.length < 100) {
      // Need at least 100 points for meaningful FFT
      return;
    }

    // ⭐ Extract Y values from signal buffer
    const yValues = currentBuffer.map((point) => point.y);

    // ⭐ Use sample rate from settings
    const sampleRate =
      useSimulationStore.getState().settings.signalSampleRate || 60;

    try {
      // Run FFT analysis
      const result = analyzeSignal(yValues, sampleRate, {
        threshold: 0.05,
        minFrequency: 0.1,
        maxFrequency: sampleRate / 2,
        maxPeaks: 20,
        minPeakDistance: 0.2,
      });

      // Create new object to trigger React re-render
      setAnalysisResult({ ...result });
      setUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("FFT Analysis Error:", error);
    }
  };

  /**
   * Analyze current signal with FFT (manual button)
   */
  const handleAnalyze = () => {
    if (signalBuffer.length === 0) {
      alert("No signal data available. Please start the animation first!");
      return;
    }

    setIsAnalyzing(true);
    performFFT();
    setIsAnalyzing(false);
  };

  /**
   * Real-time FFT update (when enabled)
   */
  useEffect(() => {
    if (!realTimeFft || !isPlaying) {
      return;
    }

    // Update FFT every 500ms for smoother updates
    // Initial update happens on first interval tick
    const interval = setInterval(() => {
      const buffer = useSignalProcessingStore.getState().signalBuffer;
      if (buffer.length >= 100) {
        performFFT();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [realTimeFft, isPlaying]);

  /**
   * ESC key to close floating spectrum
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFloatingSpectrum) {
        setShowFloatingSpectrum(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showFloatingSpectrum]);

  /**
   * Show settings dialog before generating epicycles
   */
  const handleShowGenerationDialog = () => {
    if (!analysisResult) {
      alert("Please analyze the signal first!");
      return;
    }

    if (analysisResult.peaks.length === 0) {
      alert("No significant frequency peaks found in the signal!");
      return;
    }

    setShowSettingsDialog(true);
  };

  /**
   * Generate epicycles from FFT analysis with custom settings
   */
  const handleGenerateEpicycles = (settings: GenerationSettings) => {
    if (!analysisResult) return;

    // Generate radius parameters from FFT with user settings
    const radiiParams = generateRadiiFromFFT(analysisResult, {
      maxRadii: settings.maxRadii,
      minAmplitude: settings.minAmplitude,
      scaleFactor: settings.scaleFactor,
      sortBy: settings.sortBy,
      includeDC: settings.includeDC,
      normalizeToMaxLength: 120,
    });

    if (radiiParams.length === 0) {
      alert("No radii generated. Try adjusting settings.");
      return;
    }

    // Clear existing radii
    clearRadii();

    // Create radii in chain (each child of previous)
    let parentId: string | null = null;
    let lastRadiusId: string | null = null;

    for (const params of radiiParams) {
      const newRadiusId = addRadius({
        ...params,
        parentId,
      });

      lastRadiusId = newRadiusId;
      parentId = newRadiusId; // Next radius will be child of this one
    }

    // Auto-select and track the last radius
    if (lastRadiusId) {
      selectRadius(lastRadiusId);
      setActiveTrackingRadius(lastRadiusId);
    }

    alert(
      `Generated ${radiiParams.length} epicycles from FFT analysis! 🎉\nPress Start to see the result.`
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#667eea]">
        <h2 className="text-base font-bold text-[#667eea] flex items-center gap-2">
          <BarChart3 size={16} />
          Frequency Analysis
        </h2>
      </div>

      {/* Real-time FFT Toggle ⭐ NEW */}
      <div className="flex items-center justify-between bg-[#252525] rounded-lg p-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300">Real-time FFT</span>
          <span className="text-xs text-gray-500">(updates live)</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={realTimeFft}
            onChange={(e) => setRealTimeFft(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#667eea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#667eea]"></div>
        </label>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || signalBuffer.length === 0 || realTimeFft}
        variant="primary"
        className="w-full"
      >
        {isAnalyzing ? (
          <>⏳ Analyzing...</>
        ) : realTimeFft && isPlaying ? (
          <>
            <BarChart3 size={14} className="mr-1 animate-pulse" />
            Auto-updating...
          </>
        ) : (
          <>
            <BarChart3 size={14} className="mr-1" />
            Analyze Signal
          </>
        )}
      </Button>

      {/* Results */}
      {analysisResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Spectrum Canvas ⭐ NEW! */}
          <div className="bg-[#1a1a1a] rounded-lg p-2 border border-[#333] overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-semibold">
                📊 Spectrum
              </span>
              <button
                onClick={() => setShowFloatingSpectrum(true)}
                className="text-xs text-[#667eea] hover:underline"
              >
                Expand ↗
              </button>
            </div>
            <div className="aspect-[3/1] min-h-[60px] max-h-[120px] overflow-hidden">
              <SpectrumCanvas
                key={updateCounter}
                spectrum={analysisResult.spectrum}
                maxFrequency={10}
                height={0}
                showGrid={false}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Fundamental Frequency:</span>
              <span className="text-[#667eea] font-bold text-sm">
                {analysisResult.fundamentalFrequency?.toFixed(2) || "N/A"} Hz
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Peaks Detected:</span>
              <span className="text-[#667eea] font-semibold">
                {analysisResult.peaks.length}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">THD:</span>
              <span className="text-[#667eea] font-semibold">
                {analysisResult.thd.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">DC Offset:</span>
              <span className="text-[#667eea] font-semibold">
                {analysisResult.dcOffset.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Top Peaks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">
                Top Frequencies:
              </span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-[#667eea] hover:underline flex items-center gap-1"
              >
                <Info size={12} />
                {showDetails ? "Hide" : "Show"} Details
              </button>
            </div>

            <div className="space-y-1.5">
              {analysisResult.peaks.slice(0, 5).map((peak, index) => (
                <div
                  key={index}
                  className="bg-[#252525] rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: `hsl(${240 - index * 40}, 70%, 60%)`,
                      }}
                    />
                    <span className="text-xs font-medium text-white">
                      {peak.frequency.toFixed(2)} Hz
                    </span>
                  </div>

                  {showDetails && (
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>Amp: {peak.amplitude.toFixed(4)}</span>
                      <span>
                        Phase: {((peak.phase * 180) / Math.PI).toFixed(0)}°
                      </span>
                    </div>
                  )}

                  {!showDetails && (
                    <span className="text-xs text-gray-400">
                      {(peak.relativeAmplitude * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Harmonics (if detected) */}
          {analysisResult.harmonics.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">
                Harmonics:
              </span>
              <div className="space-y-1">
                {analysisResult.harmonics.slice(0, 5).map((harmonic) => (
                  <div
                    key={harmonic.order}
                    className="bg-[#252525] rounded px-2 py-1.5 flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-300">
                      {harmonic.order === 1
                        ? "Fundamental"
                        : `${harmonic.order}${getOrdinalSuffix(
                            harmonic.order
                          )} Harmonic`}
                    </span>
                    <span className="text-[#667eea]">
                      {harmonic.energyPercentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleShowGenerationDialog}
            variant="primary"
            className="w-full"
          >
            <Sparkles size={14} className="mr-1" />
            Generate Epicycles from FFT
          </Button>

          {/* Info */}
          <div className="bg-[#252525] rounded-lg p-2 flex items-start gap-2">
            <Info size={14} className="text-[#667eea] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              This will replace current radii with epicycles generated from the
              frequency analysis.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !isAnalyzing && (
        <div className="text-center py-6 text-gray-500">
          <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">No analysis yet</p>
          <p className="text-xs mt-1">
            Run the animation, then click Analyze Signal
          </p>
        </div>
      )}

      {/* Generation Settings Dialog */}
      {showSettingsDialog && analysisResult && (
        <GenerationSettingsDialog
          analysisResult={analysisResult}
          onGenerate={handleGenerateEpicycles}
          onClose={() => setShowSettingsDialog(false)}
        />
      )}

      {/* Floating Spectrum Panel ⭐ NEW! */}
      {showFloatingSpectrum && analysisResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowFloatingSpectrum(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-xl border-2 border-[#667eea] p-6 shadow-2xl w-[800px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#667eea]">
                📊 Frequency Spectrum
              </h3>
              <button
                onClick={() => setShowFloatingSpectrum(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
                title="Close (ESC)"
              >
                ×
              </button>
            </div>

            {/* Large Spectrum */}
            <SpectrumCanvas
              key={`floating-${updateCounter}`}
              spectrum={analysisResult.spectrum}
              maxFrequency={10}
              height={400}
              showGrid={true}
            />

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="bg-[#252525] rounded p-2 text-center">
                <div className="text-xs text-gray-400">Fundamental</div>
                <div className="text-sm font-bold text-[#667eea]">
                  {analysisResult.fundamentalFrequency?.toFixed(2) || "N/A"} Hz
                </div>
              </div>
              <div className="bg-[#252525] rounded p-2 text-center">
                <div className="text-xs text-gray-400">Peaks</div>
                <div className="text-sm font-bold text-[#667eea]">
                  {analysisResult.peaks.length}
                </div>
              </div>
              <div className="bg-[#252525] rounded p-2 text-center">
                <div className="text-xs text-gray-400">THD</div>
                <div className="text-sm font-bold text-[#667eea]">
                  {analysisResult.thd.toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#252525] rounded p-2 text-center">
                <div className="text-xs text-gray-400">DC Offset</div>
                <div className="text-sm font-bold text-[#667eea]">
                  {analysisResult.dcOffset.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Close hint */}
            <div className="mt-4 text-center text-xs text-gray-500">
              Press ESC or click outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper: Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
