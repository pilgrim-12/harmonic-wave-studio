"use client";

import { useState } from "react";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { AccordionItem } from "@/components/ui/Accordion";
import { Settings, Plus } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRadiusStore } from "@/store/radiusStore";
import { RadiusItem } from "@/components/workspace/RadiusItem";
import { RadiusEditor } from "@/components/workspace/RadiusEditor";
import { Button } from "@/components/ui/Button";
import { Radius } from "@/types/radius";

export default function Home() {
  const [openPanel, setOpenPanel] = useState<string>("radii");
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);
  const { radii, addRadius } = useRadiusStore();

  useKeyboardShortcuts();

  const handleToggle = (panelId: string) => {
    setOpenPanel(openPanel === panelId ? "" : panelId);
  };

  const handleAddRadius = () => {
    let parentId: string | null = null;
    if (radii.length > 0) {
      parentId = radii[radii.length - 1].id;
    }
    addRadius({
      parentId,
      length: 30,
      initialAngle: 0,
      rotationSpeed: 1,
      direction: "counterclockwise",
    });
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
        {/* Left panel */}
        <div className="w-[260px] flex flex-col gap-3 flex-shrink-0 overflow-hidden">
          {/* Radii Panel */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AccordionItem
              title="Radii"
              icon={<span className="text-lg">⚙️</span>}
              isOpen={openPanel === "radii"}
              onToggle={() => handleToggle("radii")}
            >
              <div className="flex flex-col h-full">
                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
                  <div className="space-y-2 py-2">
                    {radii.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-xs">No radii</p>
                        <p className="text-xs mt-1">
                          Click the button below to add the first one
                        </p>
                      </div>
                    ) : (
                      radii.map((radius) => (
                        <RadiusItem
                          key={radius.id}
                          radius={radius}
                          onEdit={setEditingRadius}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Fixed button at bottom */}
                <div className="p-3 pt-2 border-t border-[#2a2a2a] flex-shrink-0">
                  <Button
                    onClick={handleAddRadius}
                    variant="secondary"
                    className="w-full text-sm"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Radius
                  </Button>
                </div>
              </div>
            </AccordionItem>
          </div>

          {/* Settings Panel */}
          <div className="flex-shrink-0">
            <AccordionItem
              title="Visualization"
              icon={<Settings size={16} className="text-[#667eea]" />}
              isOpen={openPanel === "visualization"}
              onToggle={() => handleToggle("visualization")}
            >
              <div className="px-3 pb-3">
                <SettingsPanel />
              </div>
            </AccordionItem>
          </div>
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

      {/* Editor Modal */}
      {editingRadius && (
        <RadiusEditor
          radius={editingRadius}
          onClose={() => setEditingRadius(null)}
        />
      )}
    </div>
  );
}
