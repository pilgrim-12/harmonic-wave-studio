"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { FrequencyPanel } from "@/components/analysis/FrequencyPanel";
import { NoisePanel } from "@/components/signal/NoisePanel";
import { MetricsPanel } from "@/components/signal/MetricsPanel";
import { NoisySignalGraph } from "@/components/signal/NoisySignalGraph";
import { DigitalFilterPanel } from "@/components/signal/DigitalFilterPanel";
import { FilteredSignalGraph } from "@/components/signal/FilteredSignalGraph";
import { UndoRedoIndicator } from "@/components/ui/UndoRedoIndicator";
import { AccordionItem } from "@/components/ui/Accordion";
import { FullscreenWrapper } from "@/components/ui/FullscreenWrapper";
import { ResizableSidebar } from "@/components/ui/ResizableSidebar";
import {
  Settings,
  Plus,
  BarChart3,
  Wand2,
  Save,
  FilePlus,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";
import { RadiusItem } from "@/components/workspace/RadiusItem";
import { RadiusEditor } from "@/components/workspace/RadiusEditor";
import { Button } from "@/components/ui/Button";
import { Radius } from "@/types/radius";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, updateProject } from "@/services/projectService";
import { ShareButton } from "@/components/share/ShareButton";

function HomeContent() {
  const [openPanel, setOpenPanel] = useState<string>("radii");
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const { radii, addRadius, selectRadius, updateRadius, clearRadii } =
    useRadiusStore();
  const { setActiveTrackingRadius, play, signalData } = useSimulationStore();
  const {
    currentProjectId,
    currentProjectName,
    setCurrentProject,
    clearProject,
  } = useProjectStore();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const { noisy } = useSignalProcessingStore();
  const { applyFilterToSignal, clearFilter, isFilterApplied } =
    useFilterStore();

  useKeyboardShortcuts();

  // Load shared project from URL parameter
  useLayoutEffect(() => {
    const loadSharedParam = searchParams?.get("loadShared");

    if (loadSharedParam) {
      try {
        // Decode base64 data
        const projectData = JSON.parse(atob(loadSharedParam));

        // Clear existing radii and signal processing
        clearRadii();
        useSignalProcessingStore.getState().resetSignal();

        // Convert Firebase radii to editor format
        const { radii: firebaseRadii } = projectData;

        if (!firebaseRadii || firebaseRadii.length === 0) {
          alert("This project has no radii data");
          return;
        }

        // Accumulate created radii IDs
        let previousRadiusId: string | null = null;
        let lastRadiusId: string | null = null;

        // Add radii one by one
        firebaseRadii.forEach(
          (fbRadius: {
            frequency: number;
            amplitude: number;
            phase: number;
          }) => {
            const newRadiusId = addRadius({
              parentId: previousRadiusId,
              length: fbRadius.amplitude,
              initialAngle: fbRadius.phase,
              rotationSpeed: Math.abs(fbRadius.frequency),
              direction:
                fbRadius.frequency >= 0 ? "counterclockwise" : "clockwise",
            });

            // Update for next radius
            previousRadiusId = newRadiusId;
            lastRadiusId = newRadiusId;
          }
        );

        // Select last radius
        if (lastRadiusId) {
          selectRadius(lastRadiusId);
          setActiveTrackingRadius(lastRadiusId);
        }

        // Set project in store (this triggers useEffect that updates projectName)
        if (projectData.metadata?.projectName) {
          const projectNameFromGallery = `${projectData.metadata.projectName} (from gallery)`;
          setCurrentProject(null, projectNameFromGallery, firebaseRadii);
        }

        // Start animation after short delay
        setTimeout(() => {
          play();
        }, 200);

        // Clean URL (remove parameter)
        window.history.replaceState({}, "", "/");
      } catch (error) {
        console.error("Error loading shared project:", error);
        alert("Failed to load project from gallery");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (currentProjectName) {
      setProjectName(currentProjectName);
    }
  }, [currentProjectName]);

  useEffect(() => {
    if (radii.length > 0) {
      setTimeout(() => play(), 100);
    }
  }, [radii.length, play]);

  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 1000 / 30;

    const updateSignal = (timestamp: number) => {
      if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
        const signal = useSimulationStore.getState().getSignalYValues();

        if (signal.length > 100) {
          useSignalProcessingStore.getState().setOriginalSignal(signal);
        }

        lastUpdate = timestamp;
      }

      animationFrameId = requestAnimationFrame(updateSignal);
    };

    animationFrameId = requestAnimationFrame(updateSignal);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const handleToggle = (panelId: string) => {
    setOpenPanel(openPanel === panelId ? "" : panelId);
  };

  const handleAddRadius = () => {
    let parentId: string | null = null;
    if (radii.length > 0) {
      parentId = radii[radii.length - 1].id;
    }
    const newRadiusId = addRadius({
      parentId,
      length: 30,
      initialAngle: 0,
      rotationSpeed: 1,
      direction: "counterclockwise",
    });

    selectRadius(newRadiusId);
    setActiveTrackingRadius(newRadiusId);
  };

  const handleNormalizeAll = () => {
    if (radii.length === 0) return;

    let normalizedCount = 0;

    radii.forEach((radius) => {
      let needsUpdate = false;
      const updates: Partial<Radius> = {};

      let angle = radius.initialAngle % (2 * Math.PI);
      if (angle < 0) angle += 2 * Math.PI;
      if (angle !== radius.initialAngle) {
        updates.initialAngle = angle;
        updates.currentAngle = angle;
        needsUpdate = true;
      }

      const speed = Math.max(0.1, Math.min(radius.rotationSpeed, 10));
      if (speed !== radius.rotationSpeed) {
        updates.rotationSpeed = speed;
        needsUpdate = true;
      }

      const length = Math.max(5, Math.min(radius.length, 200));
      if (length !== radius.length) {
        updates.length = length;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateRadius(radius.id, updates);
        normalizedCount++;
      }
    });

    if (normalizedCount > 0) {
      alert(
        `✅ Normalized ${normalizedCount} ${
          normalizedCount === 1 ? "radius" : "radii"
        }!\n\n` +
          `Fixed:\n` +
          `• Angles wrapped to [0, 2π)\n` +
          `• Speeds clamped to [0.1, 10]\n` +
          `• Lengths clamped to [5, 200]`
      );
    } else {
      alert("✓ All radii are already normalized!");
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
      alert("❌ Please sign in to save projects");
      return;
    }

    if (radii.length === 0) {
      alert("❌ No radii to save. Please add some radii first.");
      return;
    }

    const name = projectName.trim() || "Untitled Project";

    setSaving(true);
    try {
      const projectRadii = radii.map((r) => ({
        frequency:
          r.direction === "counterclockwise"
            ? r.rotationSpeed
            : -r.rotationSpeed,
        amplitude: r.length,
        phase: r.initialAngle,
      }));

      if (currentProjectId) {
        await updateProject(currentProjectId, name, projectRadii);
        alert("✅ Project updated successfully!");
      } else {
        const newProjectId = await createProject(user.uid, name, projectRadii);
        setCurrentProject(newProjectId, name, projectRadii);
        alert("✅ Project saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("❌ Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewProject = () => {
    if (radii.length > 0) {
      const confirm = window.confirm(
        "⚠️ Start new project?\n\nThis will clear all current radii and signal data."
      );
      if (!confirm) return;
    }

    clearRadii();
    clearProject();
    setProjectName("");
    setShareId(null);
    useSignalProcessingStore.getState().resetSignal();
    alert("✅ New project started!");
  };

  const handleShareSuccess = (newShareId: string) => {
    setShareId(newShareId);
  };

  const handleApplyFilter = (filterSettings: {
    type: "butterworth" | "chebyshev1" | "chebyshev2";
    mode: "lowpass" | "highpass" | "bandpass" | "bandstop";
    order: number;
    cutoffFreq: number;
    enabled: boolean;
  }) => {
    // Convert signalData to number[] if needed
    let signalArray: number[] = [];

    if (signalData.length > 0) {
      if (typeof signalData[0] === "object" && "y" in signalData[0]) {
        // signalData is SignalDataPoint[] - extract y values
        signalArray = signalData.map((point) => (point as { y: number }).y);
      } else {
        // signalData is already number[]
        signalArray = signalData as unknown as number[];
      }
    }

    const signalToFilter = noisy.length > 0 ? noisy : signalArray;

    if (signalToFilter.length === 0) {
      alert("⚠️ No signal available. Start animation first!");
      return;
    }
    applyFilterToSignal(signalToFilter, filterSettings, 30);
  };

  const handleClearFilter = () => {
    clearFilter();
  };

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      <header className="border-b border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-3 gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 size={24} className="text-[#667eea]" />
              <span className="font-bold text-white text-lg">
                Harmonic Wave Studio
              </span>
            </Link>

            <div className="h-6 w-px bg-[#2a2a2a]" />

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name..."
              className="px-3 py-1.5 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#667eea] w-48"
            />
          </div>

          {!loading && user && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleNewProject}
                variant="secondary"
                className="text-sm"
              >
                <FilePlus size={14} className="mr-1" />
                New
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={saving}
                variant="primary"
                className="text-sm"
              >
                <Save size={14} className="mr-1" />
                {saving ? "Saving..." : currentProjectId ? "Update" : "Save"}
              </Button>

              {currentProjectId && (
                <ShareButton
                  projectId={currentProjectId}
                  projectName={projectName}
                  isShared={!!shareId}
                  shareId={shareId}
                  onShareSuccess={handleShareSuccess}
                />
              )}

              {/* Gallery Button */}
              <Link href="/gallery">
                <Button
                  variant="secondary"
                  className="text-sm"
                  title="Browse community projects"
                >
                  <LayoutGrid size={14} className="mr-1" />
                  Gallery
                </Button>
              </Link>
            </div>
          )}

          <UndoRedoIndicator />

          <div className="flex items-center">
            {loading ? (
              <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <UserMenu />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Left panel */}
        <ResizableSidebar>
          {/* Radii Panel */}
          <div
            className={
              openPanel === "radii"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-shrink-0"
            }
          >
            <AccordionItem
              title="Radii"
              icon={<span className="text-lg">⚙️</span>}
              isOpen={openPanel === "radii"}
              onToggle={() => handleToggle("radii")}
            >
              {openPanel === "radii" && (
                <div className="flex flex-col h-full">
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

                  <div className="p-3 pt-2 border-t border-[#2a2a2a] flex-shrink-0 space-y-2">
                    {radii.length > 0 && (
                      <Button
                        onClick={handleNormalizeAll}
                        variant="secondary"
                        className="w-full text-sm"
                        title="Fix invalid angles, speeds, and lengths"
                      >
                        <Wand2 size={14} className="mr-1" />
                        Normalize All
                      </Button>
                    )}

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
              )}
            </AccordionItem>
          </div>

          {/* Signal Processing Panel */}
          <div
            className={
              openPanel === "signal"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-shrink-0"
            }
          >
            <AccordionItem
              title="Signal Processing"
              icon={<Activity size={16} className="text-[#667eea]" />}
              isOpen={openPanel === "signal"}
              onToggle={() => handleToggle("signal")}
            >
              {openPanel === "signal" && (
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <div className="px-3 pb-3 space-y-3">
                    <NoisePanel />
                    <DigitalFilterPanel
                      onApplyFilter={handleApplyFilter}
                      onClearFilter={handleClearFilter}
                      isFilterApplied={isFilterApplied}
                      sampleRate={30}
                    />
                    <MetricsPanel />
                  </div>
                </div>
              )}
            </AccordionItem>
          </div>

          {/* Visualization Panel */}
          <div
            className={
              openPanel === "visualization"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-shrink-0"
            }
          >
            <AccordionItem
              title="Visualization"
              icon={<Settings size={16} className="text-[#667eea]" />}
              isOpen={openPanel === "visualization"}
              onToggle={() => handleToggle("visualization")}
            >
              {openPanel === "visualization" && (
                <div
                  className="overflow-y-auto custom-scrollbar px-3 pb-3"
                  style={{ maxHeight: "calc(100vh - 200px)" }}
                >
                  <SettingsPanel />
                </div>
              )}
            </AccordionItem>
          </div>

          {/* Analysis Panel */}
          <div
            className={
              openPanel === "analysis"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-shrink-0"
            }
          >
            <AccordionItem
              title="Analysis"
              icon={<BarChart3 size={16} className="text-[#667eea]" />}
              isOpen={openPanel === "analysis"}
              onToggle={() => handleToggle("analysis")}
            >
              {openPanel === "analysis" && (
                <div className="h-full overflow-y-auto custom-scrollbar px-3 pb-3">
                  <FrequencyPanel />
                </div>
              )}
            </AccordionItem>
          </div>
        </ResizableSidebar>

        {/* Right workspace */}
        <div className="flex-1 grid grid-rows-[auto_1fr_1fr] gap-3 min-w-0 min-h-0">
          <div className="flex-shrink-0">
            <ControlPanel />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <FullscreenWrapper>
              <VisualizationCanvas />
            </FullscreenWrapper>
          </div>

          {/* Signal Graphs - 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            {/* Original Signal */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
              <SignalGraph />
            </div>

            {/* Noisy Signal */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
              <NoisySignalGraph />
            </div>

            {/* Filtered Signal */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
              <FilteredSignalGraph />
            </div>
          </div>
        </div>
      </div>

      {editingRadius && (
        <RadiusEditor
          radius={editingRadius}
          onClose={() => setEditingRadius(null)}
        />
      )}
    </div>
  );
}

// Wrap in Suspense to fix useSearchParams build error
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading studio...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
