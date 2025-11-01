"use client";

import { useState } from "react";
import { RadiusPanel } from "@/components/workspace/RadiusPanel";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { AccordionItem } from "@/components/ui/Accordion";
import { Settings } from "lucide-react";

export default function Home() {
  const [openPanel, setOpenPanel] = useState<string>("radii");

  const handleToggle = (panelId: string) => {
    setOpenPanel(openPanel === panelId ? "" : panelId);
  };

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col p-3">
      {/* Compact Header */}
      <header className="mb-3 text-center flex-shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🌊 Harmonic Wave Studio
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Visualize, Analyze, Filter - Signal Processing with Epicycles
        </p>
      </header>

      {/* Main layout */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Left panel - Controlled Accordion */}
        <div className="w-[260px] flex flex-col gap-3 flex-shrink-0 overflow-auto">
          {/* Radii Panel */}
          <AccordionItem
            title="Radii"
            icon={<span className="text-lg">⚙️</span>}
            isOpen={openPanel === "radii"}
            onToggle={() => handleToggle("radii")}
          >
            <RadiusPanel />
          </AccordionItem>

          {/* Settings Panel */}
          <AccordionItem
            title="Visualization"
            icon={<Settings size={16} className="text-[#667eea]" />}
            isOpen={openPanel === "visualization"}
            onToggle={() => handleToggle("visualization")}
          >
            <SettingsPanel />
          </AccordionItem>
        </div>

        {/* Right workspace */}
        <div className="flex-1 grid grid-rows-[auto_1fr_1fr] gap-3 min-w-0 min-h-0">
          {/* Control panel */}
          <div className="flex-shrink-0">
            <ControlPanel />
          </div>

          {/* Visualization Canvas */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <VisualizationCanvas />
          </div>

          {/* Signal Graph */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <SignalGraph />
          </div>
        </div>
      </div>
    </div>
  );
}
