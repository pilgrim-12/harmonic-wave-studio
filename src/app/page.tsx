"use client";

import { RadiusPanel } from "@/components/workspace/RadiusPanel";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4">
      {/* Compact Header */}
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🌊 Harmonic Wave Studio
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          Visualize, Analyze, Filter - Signal Processing with Epicycles
        </p>
      </header>

      {/* Main layout - narrower left panel */}
      <div className="grid grid-cols-[280px_1fr] gap-4 max-w-[1800px] mx-auto">
        {/* Left panel */}
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <RadiusPanel />
          </div>
          <SettingsPanel />
        </div>

        {/* Right workspace */}
        <div className="space-y-4">
          {/* Control panel */}
          <ControlPanel />

          {/* Visualization Canvas */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] h-[450px] overflow-hidden">
            <VisualizationCanvas />
          </div>

          {/* Signal Graph */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] h-[280px] overflow-hidden">
            <SignalGraph />
          </div>
        </div>
      </div>
    </div>
  );
}
