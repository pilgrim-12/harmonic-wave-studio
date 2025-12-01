"use client";

import React, { useState } from "react";
import { X, Activity, Target, Zap, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FrequencyResponsePanel } from "@/components/signal/FrequencyResponsePanel";
import { ZPlanePanel } from "@/components/signal/ZPlanePanel";
import { PWMPanel } from "@/components/signal/PWMPanel";
import { ModulationPanel } from "@/components/signal/ModulationPanel";

type AnalysisTab = "frequency" | "zplane" | "pwm" | "modulation";

interface SignalAnalysisModalProps {
  onClose: () => void;
  defaultTab?: AnalysisTab;
}

export const SignalAnalysisModal: React.FC<SignalAnalysisModalProps> = ({
  onClose,
  defaultTab = "frequency",
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(defaultTab);

  const tabs: { id: AnalysisTab; label: string; icon: React.ReactNode }[] = [
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
