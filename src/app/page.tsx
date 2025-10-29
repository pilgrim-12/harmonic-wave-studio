"use client";

import { RadiusPanel } from "@/components/workspace/RadiusPanel";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🌊 Harmonic Wave Studio
        </h1>
        <p className="text-gray-400 mt-2">
          Visualize, Analyze, Filter - Signal Processing with Epicycles
        </p>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-[320px_1fr] gap-6 max-w-[1600px] mx-auto">
        {/* Left panel */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
            <RadiusPanel />
          </div>
          <SettingsPanel />
        </div>

        {/* Right workspace */}
        <div className="space-y-6">
          {/* Control panel */}
          <ControlPanel />

          {/* Visualization Canvas */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] h-[500px] overflow-hidden">
            <VisualizationCanvas />
          </div>

          {/* Signal Graph */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] h-[300px] overflow-hidden">
            <SignalGraph />
          </div>
        </div>
      </div>
    </div>
  );
}
