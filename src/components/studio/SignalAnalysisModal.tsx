"use client";

import React, { useState } from "react";
import { X, Activity, Target, Zap, Radio, FunctionSquare, Info, Lightbulb, Filter, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FrequencyResponsePanel } from "@/components/signal/FrequencyResponsePanel";
import { ZPlanePanel } from "@/components/signal/ZPlanePanel";
import { PWMPanel } from "@/components/signal/PWMPanel";
import { ModulationPanel } from "@/components/signal/ModulationPanel";
import { FormulaDisplay } from "@/components/studio/FormulaDisplay";
import { useRadiusStore } from "@/store/radiusStore";
import { useFilterStore } from "@/store/filterStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useTierCheck } from "@/hooks/useTierCheck";

type AnalysisTab = "formula" | "frequency" | "zplane" | "pwm" | "modulation";

interface SignalAnalysisModalProps {
  onClose: () => void;
  defaultTab?: AnalysisTab;
}

// Quick filter presets for easy application
const FILTER_PRESETS = [
  { name: "Low-pass 50Hz", type: "butterworth" as const, mode: "lowpass" as const, cutoff: 50, order: 4 },
  { name: "Low-pass 100Hz", type: "butterworth" as const, mode: "lowpass" as const, cutoff: 100, order: 4 },
  { name: "High-pass 20Hz", type: "butterworth" as const, mode: "highpass" as const, cutoff: 20, order: 4 },
  { name: "High-pass 100Hz", type: "butterworth" as const, mode: "highpass" as const, cutoff: 100, order: 4 },
];

export const SignalAnalysisModal: React.FC<SignalAnalysisModalProps> = ({
  onClose,
  defaultTab = "formula",
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(defaultTab);
  const { radii } = useRadiusStore();
  const { isFilterApplied, applyFilterToSignal, filterSettings } = useFilterStore();
  const { noisy, original } = useSignalProcessingStore();
  const { settings } = useSimulationStore();
  const { hasAccess: canUseFilters } = useTierCheck("canUseFilters");

  const tabs: { id: AnalysisTab; label: string; icon: React.ReactNode; description: string; proOnly?: boolean }[] = [
    { id: "formula", label: "Formula", icon: <FunctionSquare size={16} />, description: "View the mathematical formula of your signal" },
    { id: "frequency", label: "Freq Response", icon: <Activity size={16} />, description: "Analyze filter frequency response", proOnly: true },
    { id: "zplane", label: "Z-Plane", icon: <Target size={16} />, description: "Visualize poles and zeros", proOnly: true },
    { id: "pwm", label: "PWM", icon: <Zap size={16} />, description: "Pulse Width Modulation analysis", proOnly: true },
    { id: "modulation", label: "Modulation", icon: <Radio size={16} />, description: "AM/FM signal modulation", proOnly: true },
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

  // Apply a quick filter preset
  const handleApplyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    const signalToFilter = noisy.length > 0 ? noisy : original;
    if (signalToFilter.length === 0) return;

    applyFilterToSignal(
      signalToFilter,
      {
        type: preset.type,
        mode: preset.mode,
        cutoffFreq: preset.cutoff,
        order: preset.order,
        enabled: true,
      },
      settings.signalSampleRate || 30
    );
  };

  // Check if signal exists
  const hasSignal = original.length > 0 || noisy.length > 0;

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
            <div>
              <h2 className="text-lg font-semibold text-white">Signal Analysis</h2>
              <p className="text-xs text-gray-500">
                {radii.length > 0
                  ? `Analyzing ${radii.length} harmonic${radii.length > 1 ? 's' : ''}`
                  : 'Add radii to start analysis'}
              </p>
            </div>
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
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 relative ${
                activeTab === tab.id
                  ? "text-[#667eea] border-[#667eea] bg-[#667eea]/10"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-[#1a1a1a]"
              }`}
              title={tab.description}
            >
              {tab.icon}
              {tab.label}
              {tab.proOnly && !canUseFilters && (
                <Crown size={12} className="text-[#feca57] ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="h-full">
            {activeTab === "formula" && (
              <div className="h-full">
                {radii.length === 0 ? (
                  <EmptyState
                    icon={<FunctionSquare size={48} className="text-[#667eea]" />}
                    title="No Signal Formula"
                    description="Add radii to your visualization to see the mathematical formula. Each radius represents a harmonic component in the Fourier series."
                    action={
                      <Button variant="secondary" size="sm" onClick={onClose}>
                        Go to Studio
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    }
                  />
                ) : (
                  <div className="max-w-2xl">
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
              </div>
            )}

            {activeTab === "frequency" && (
              <div className="h-full">
                {!canUseFilters ? (
                  <ProFeatureGate feature="Frequency Response Analysis" />
                ) : !isFilterApplied ? (
                  <EmptyStateWithQuickActions
                    icon={<Activity size={48} className="text-[#667eea]" />}
                    title="Apply a Filter to See Response"
                    description="The frequency response shows how the filter affects different frequencies. Apply a filter preset below or configure a custom filter in the left panel."
                    presets={FILTER_PRESETS}
                    onApplyPreset={handleApplyPreset}
                    hasSignal={hasSignal}
                  />
                ) : (
                  <div className="h-full">
                    <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Filter size={14} className="text-[#667eea]" />
                        <span>Active Filter:</span>
                        <span className="text-white font-medium">
                          {filterSettings?.type} {filterSettings?.mode}, Order {filterSettings?.order}, Cutoff {filterSettings?.cutoffFreq}Hz
                        </span>
                      </div>
                    </div>
                    <FrequencyResponsePanel className="h-[calc(100%-60px)]" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "zplane" && (
              <div className="h-full">
                {!canUseFilters ? (
                  <ProFeatureGate feature="Z-Plane Analysis" />
                ) : !isFilterApplied ? (
                  <EmptyStateWithQuickActions
                    icon={<Target size={48} className="text-[#f093fb]" />}
                    title="Apply a Filter to See Z-Plane"
                    description="The Z-plane shows poles (X) and zeros (O) of your filter. Poles inside the unit circle indicate a stable filter. The closer poles are to the circle, the more resonant the filter."
                    presets={FILTER_PRESETS}
                    onApplyPreset={handleApplyPreset}
                    hasSignal={hasSignal}
                    learnMoreItems={[
                      "Poles determine filter stability and resonance",
                      "Zeros create frequency nulls (notches)",
                      "Pole locations affect frequency response shape"
                    ]}
                  />
                ) : (
                  <ZPlanePanel className="h-full" />
                )}
              </div>
            )}

            {activeTab === "pwm" && (
              <div className="h-full">
                {!canUseFilters ? (
                  <ProFeatureGate feature="PWM Analysis" />
                ) : (
                  <div className="h-full">
                    <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-[#feca57] mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-400">
                          <span className="text-white font-medium">Tip:</span> PWM (Pulse Width Modulation) converts your signal into pulses.
                          Use &quot;From Epicycle Signal&quot; mode to see how your waveform would be encoded as PWM, commonly used in motor control and LED dimming.
                        </div>
                      </div>
                    </div>
                    <PWMPanel className="h-[calc(100%-60px)]" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "modulation" && (
              <div className="h-full">
                {!canUseFilters ? (
                  <ProFeatureGate feature="Signal Modulation" />
                ) : (
                  <div className="h-full">
                    <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-[#feca57] mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-400">
                          <span className="text-white font-medium">Tip:</span> Modulation is how radio transmits audio. AM modulates amplitude,
                          FM modulates frequency. Use &quot;From Epicycle Signal&quot; mode to modulate a carrier with your waveform.
                        </div>
                      </div>
                    </div>
                    <ModulationPanel className="h-[calc(100%-60px)]" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with keyboard hint */}
        <div className="border-t border-[#2a2a2a] px-4 py-2 flex items-center justify-between bg-[#0a0a0a]">
          <div className="text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-400">Esc</kbd> to close
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={12} />
            Analysis updates in real-time as you modify radii
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  </div>
);

// Empty state with quick action buttons
interface EmptyStateWithQuickActionsProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  presets: typeof FILTER_PRESETS;
  onApplyPreset: (preset: typeof FILTER_PRESETS[0]) => void;
  hasSignal: boolean;
  learnMoreItems?: string[];
}

const EmptyStateWithQuickActions: React.FC<EmptyStateWithQuickActionsProps> = ({
  icon,
  title,
  description,
  presets,
  onApplyPreset,
  hasSignal,
  learnMoreItems,
}) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center max-w-lg">
      <div className="mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      {hasSignal ? (
        <>
          <p className="text-xs text-gray-400 mb-3">Quick Apply Filter Preset:</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => onApplyPreset(preset)}
                className="text-xs"
              >
                <Filter size={12} className="mr-1" />
                {preset.name}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] mb-4">
          <p className="text-xs text-gray-400">
            Start the animation to generate a signal first, then apply a filter.
          </p>
        </div>
      )}

      {learnMoreItems && (
        <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-left">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-[#feca57]" />
            <span className="text-xs font-medium text-white">Learn More</span>
          </div>
          <ul className="space-y-1">
            {learnMoreItems.map((item, index) => (
              <li key={index} className="text-xs text-gray-500 flex items-start gap-2">
                <span className="text-[#667eea]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// Pro feature gate component
interface ProFeatureGateProps {
  feature: string;
}

const ProFeatureGate: React.FC<ProFeatureGateProps> = ({ feature }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-full flex items-center justify-center">
          <Crown size={32} className="text-[#feca57]" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
      <p className="text-sm text-gray-500 mb-6">
        This advanced analysis tool is available with Pro subscription. Upgrade to unlock powerful signal processing features.
      </p>
      <Button
        variant="primary"
        className="bg-gradient-to-r from-[#667eea] to-[#764ba2]"
        onClick={() => window.location.href = '/pricing'}
      >
        <Crown size={16} className="mr-2" />
        Upgrade to Pro
      </Button>
      <p className="text-xs text-gray-600 mt-3">Starting at $5/month</p>
    </div>
  </div>
);
