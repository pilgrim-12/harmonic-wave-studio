"use client";

import React, { useState } from "react";
import { X, Activity, Target, Zap, Radio, FunctionSquare, BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FrequencyResponsePanel } from "@/components/signal/FrequencyResponsePanel";
import { ZPlanePanel } from "@/components/signal/ZPlanePanel";
import { PWMPanel } from "@/components/signal/PWMPanel";
import { ModulationPanel } from "@/components/signal/ModulationPanel";
import { FormulaDisplay } from "@/components/studio/FormulaDisplay";
import { FrequencyPanel } from "@/components/analysis/FrequencyPanel";
import { DigitalFilterPanel, FilterSettings } from "@/components/signal/DigitalFilterPanel";
import { useRadiusStore } from "@/store/radiusStore";
import { useFilterStore } from "@/store/filterStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useToast } from "@/contexts/ToastContext";
import { FeatureGate } from "@/components/tier/FeatureGate";

type AnalysisTab = "formula" | "fft" | "filters" | "frequency" | "zplane" | "pwm" | "modulation";

interface SignalAnalysisModalProps {
  onClose: () => void;
  defaultTab?: AnalysisTab;
}

export const SignalAnalysisModal: React.FC<SignalAnalysisModalProps> = ({
  onClose,
  defaultTab = "formula",
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(defaultTab);
  const { radii } = useRadiusStore();
  const { applyFilterToSignal, clearFilter, isFilterApplied } = useFilterStore();
  const { settings } = useSimulationStore();
  const toast = useToast();

  const handleApplyFilter = (filterSettings: FilterSettings) => {
    const { original, noisy } = useSignalProcessingStore.getState();
    const signalToFilter = noisy.length > 0 ? noisy : original;

    if (signalToFilter.length === 0) {
      toast.warning("No signal available. Start animation first!");
      return;
    }

    const sampleRate = settings.signalSampleRate || 30;
    applyFilterToSignal(signalToFilter, filterSettings, sampleRate);
  };

  const handleClearFilter = () => {
    clearFilter();
  };

  const tabs: { id: AnalysisTab; label: string; icon: React.ReactNode }[] = [
    { id: "formula", label: "Formula", icon: <FunctionSquare size={16} /> },
    { id: "fft", label: "FFT Analysis", icon: <BarChart3 size={16} /> },
    { id: "filters", label: "Filters", icon: <Filter size={16} /> },
    { id: "frequency", label: "Frequency Response", icon: <Activity size={16} /> },
    { id: "zplane", label: "Z-Plane", icon: <Target size={16} /> },
    { id: "pwm", label: "PWM", icon: <Zap size={16} /> },
    { id: "modulation", label: "Modulation", icon: <Radio size={16} /> },
  ];

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] shadow-2xl w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[#667eea]" />
            <h2 className="text-lg font-semibold text-white">Signal Analysis</h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="!p-2"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] bg-[#0a0a0a]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-[#667eea] border-[#667eea] bg-[#667eea]/10"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="h-full">
            {activeTab === "formula" && (
              <div className="h-full max-w-2xl">
                <FormulaDisplay radii={radii.map((r) => ({
                  frequency: r.direction === "counterclockwise" ? r.rotationSpeed : -r.rotationSpeed,
                  amplitude: r.length,
                  phase: r.initialAngle,
                  color: r.color,
                  envelope: r.envelope,
                  sweep: r.sweep,
                  lfo: r.lfo,
                  timeline: r.timeline,
                }))} />
              </div>
            )}
            {activeTab === "fft" && (
              <div className="h-full max-w-3xl">
                <FeatureGate feature="canUseFFT" showLockedOverlay>
                  <FrequencyPanel />
                </FeatureGate>
              </div>
            )}
            {activeTab === "filters" && (
              <div className="h-full max-w-md">
                <FeatureGate feature="canUseFilters" showLockedOverlay>
                  <DigitalFilterPanel
                    onApplyFilter={handleApplyFilter}
                    onClearFilter={handleClearFilter}
                    isFilterApplied={isFilterApplied}
                    sampleRate={settings.signalSampleRate || 30}
                  />
                </FeatureGate>
              </div>
            )}
            {activeTab === "frequency" && (
              <div className="h-full">
                <FrequencyResponsePanel className="h-full" />
              </div>
            )}
            {activeTab === "zplane" && (
              <div className="h-full">
                <ZPlanePanel className="h-full" />
              </div>
            )}
            {activeTab === "pwm" && (
              <div className="h-full">
                <PWMPanel className="h-full" />
              </div>
            )}
            {activeTab === "modulation" && (
              <div className="h-full">
                <ModulationPanel className="h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
