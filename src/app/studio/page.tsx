"use client";

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { FrequencyPanel } from "@/components/analysis/FrequencyPanel";
import { SpectrumGraphPanel } from "@/components/workspace/SpectrumGraphPanel";
import { DecompositionGraph } from "@/components/workspace/DecompositionGraph";
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
  Save,
  FilePlus,
  Activity,
  LayoutGrid,
  Heart,
  Sliders,
  FunctionSquare,
  Box,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { useFilterStore } from "@/store/filterStore";
import { useGraphVisibilityStore } from "@/store/graphVisibilityStore";
import { RadiusItem } from "@/components/workspace/RadiusItem";
import { RadiusEditor } from "@/components/workspace/RadiusEditor";
import { Button } from "@/components/ui/Button";
import { StatusBar } from "@/components/ui/StatusBar";
import { Radius } from "@/types/radius";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, updateProject, getUserProjects } from "@/services/projectService";
import { ShareButton } from "@/components/share/ShareButton";
import { useToast } from "@/contexts/ToastContext";
import {
  calculateRadiusPositions,
  getFinalPoint,
} from "@/lib/canvas/calculator";
import { FeatureGate } from "@/components/tier/FeatureGate";
import { useTierCheck } from "@/hooks/useTierCheck";
import { normalizeRadius } from "@/lib/validation/normalizeRadius";
import { FormulaDisplay } from "@/components/studio/FormulaDisplay";
import { Visualization3DModal } from "@/components/studio/Visualization3DModal";

function HomeContent() {
  const [openPanel, setOpenPanel] = useState<string>("radii");
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [show3DModal, setShow3DModal] = useState(false);

  // ✅ Ref for animation loop
  const animationFrameRef = useRef<number | null>(null);

  const { radii, addRadius, selectRadius, clearRadii, selectedRadiusId } =
    useRadiusStore();
  const {
    isPlaying,
    settings,
    activeTrackingRadiusId,
    setActiveTrackingRadius,
    trackedRadiusIds,
    play,
  } = useSimulationStore();
  const {
    currentProjectId,
    currentProjectName,
    setCurrentProject,
    clearProject,
  } = useProjectStore();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  // Signal processing store used via getState() in effects
  const { applyFilterToSignal, clearFilter, isFilterApplied } =
    useFilterStore();
  const { checkLimit } = useTierCheck();
  const toast = useToast();
  const { showOriginalSignal, showNoisySignal, showFilteredSignal, showSpectrum, showDecomposition } =
    useGraphVisibilityStore();

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
          toast.error("This project has no radii data");
          return;
        }

        // Accumulate created radii IDs
        let previousRadiusId: string | null = null;
        let lastRadiusId: string | null = null;

        // Add radii one by one with automatic normalization
        firebaseRadii.forEach(
          (fbRadius: {
            frequency: number;
            amplitude: number;
            phase: number;
          }) => {
            // Normalize values before adding
            const normalized = normalizeRadius({
              length: fbRadius.amplitude,
              initialAngle: fbRadius.phase,
              rotationSpeed: Math.abs(fbRadius.frequency),
            });

            const newRadiusId = addRadius({
              parentId: previousRadiusId,
              length: normalized.length,
              initialAngle: normalized.initialAngle,
              rotationSpeed: normalized.rotationSpeed,
              direction:
                fbRadius.frequency >= 0 ? "counterclockwise" : "clockwise",
            });

            // Update for next radius
            previousRadiusId = newRadiusId;
            lastRadiusId = newRadiusId;
          }
        );

        // Select last radius after all radii are loaded
        if (lastRadiusId) {
          const radiusIdToSelect = lastRadiusId;
          // Use setTimeout to ensure radii are fully loaded into store
          setTimeout(() => {
            selectRadius(radiusIdToSelect);
            useSimulationStore.getState().setActiveTrackingRadius(radiusIdToSelect);
            useSimulationStore.getState().toggleTrailTracking(radiusIdToSelect);
          }, 100);
        }

        // Set project in store (this triggers useEffect that updates projectName)
        if (projectData.metadata?.projectName) {
          const projectNameFromGallery = `${projectData.metadata.projectName} (from gallery)`;
          setCurrentProject(null, projectNameFromGallery);
        }

        // Start animation after short delay
        setTimeout(() => {
          play();
        }, 200);

        // Clean URL (remove parameter)
        window.history.replaceState({}, "", "/studio");
      } catch (error) {
        console.error("Error loading shared project:", error);
        toast.error("Failed to load project from gallery");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync projectName with currentProjectName from store (on mount and when it changes)
  useEffect(() => {
    setProjectName(currentProjectName);
  }, [currentProjectName]);

  useEffect(() => {
    if (radii.length > 0) {
      setTimeout(() => play(), 100);
    }
  }, [radii.length, play]);

  // Restore selected radius trail on mount
  useEffect(() => {
    if (selectedRadiusId && radii.length > 0 && trackedRadiusIds.length === 0) {
      requestAnimationFrame(() => {
        setActiveTrackingRadius(selectedRadiusId);
        useSimulationStore.getState().toggleTrailTracking(selectedRadiusId);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================
  // ✅ NEW: CENTRALIZED SIGNAL GENERATION (Single Source of Truth)
  // ==========================================================================
  useEffect(() => {
    // Virtual canvas center for calculations
    const CENTER_X = 400;
    const CENTER_Y = 300;

    // ✅ Throttle: update store at most 30 times per second
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 1000 / 30; // 33.3ms

    const generateSignal = (timestamp: number) => {
      // Only generate when playing and radii exist
      if (!isPlaying || radii.length === 0) {
        animationFrameRef.current = requestAnimationFrame(generateSignal);
        return;
      }

      // ✅ Throttle updates
      if (timestamp - lastUpdateTime < UPDATE_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(generateSignal);
        return;
      }
      lastUpdateTime = timestamp;

      // Get current time from simulation store
      const time = useSimulationStore.getState().currentTime;

      // Calculate radius positions
      const positions = calculateRadiusPositions(
        radii,
        CENTER_X,
        CENTER_Y,
        time
      );

      // Determine which point to track
      let finalPoint = null;

      if (activeTrackingRadiusId) {
        const trackingPosition = positions.find(
          (pos) => pos.radiusId === activeTrackingRadiusId
        );
        finalPoint = trackingPosition?.endPoint || null;
      } else {
        finalPoint = getFinalPoint(positions);
      }

      // ✅ Push signal point to centralized store (Single Source of Truth)
      if (finalPoint) {
        const y = CENTER_Y - finalPoint.y;
        useSignalProcessingStore.getState().pushSignalPoint(time, y);
      }

      // ✅ Real-time filtering (if enabled) - throttled
      const filterState = useFilterStore.getState();
      if (filterState.isFilterApplied && filterState.filterSettings) {
        const noisySignal = useSignalProcessingStore.getState().noisy;
        if (noisySignal.length > 50) {
          const sampleRate =
            useSimulationStore.getState().settings.signalSampleRate || 30;
          filterState.applyFilterToSignal(
            noisySignal,
            filterState.filterSettings,
            sampleRate
          );
        }
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(generateSignal);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(generateSignal);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, radii, activeTrackingRadiusId]);

  // ==========================================================================
  // ✅ Sync buffer duration with graph duration setting
  // ==========================================================================
  useEffect(() => {
    useSignalProcessingStore
      .getState()
      .setBufferDuration(settings.graphDuration);
  }, [settings.graphDuration]);

  // ==========================================================================
  // ✅ Clear buffer when radii change
  // ==========================================================================
  useEffect(() => {
    useSignalProcessingStore.getState().clearBuffer();
  }, [radii, activeTrackingRadiusId]);

  const handleToggle = (panelId: string) => {
    setOpenPanel(openPanel === panelId ? "" : panelId);
  };

  const handleAddRadius = () => {
    // Check radii limit
    const { allowed, remaining, isUnlimited } = checkLimit(
      "maxRadii",
      radii.length
    );

    if (!allowed) {
      toast.warning(
        `You can't add more radii on your current plan. ${
          user
            ? "Upgrade to Pro for unlimited radii!"
            : "Sign in for free to get 5 radii!"
        }`,
        "Radii Limit Reached"
      );
      return;
    }

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

    // Автоматически включаем траекторию для нового радиуса
    const { toggleTrailTracking } = useSimulationStore.getState();
    toggleTrailTracking(newRadiusId);

    // Show warning when approaching limit
    if (!isUnlimited && remaining <= 1 && remaining > 0) {
      setTimeout(() => {
        toast.warning(
          `Only ${remaining} radius slot left. Upgrade to Pro for unlimited radii.`,
          "Almost at Limit"
        );
      }, 500);
    }
  };


  const handleSaveProject = async () => {
    if (!user) {
      toast.error("Please sign in to save projects", "Sign In Required");
      return;
    }

    if (radii.length === 0) {
      toast.error("No radii to save. Please add some radii first.", "No Radii");
      return;
    }

    // Check project limit for new projects
    if (!currentProjectId) {
      try {
        const userProjects = await getUserProjects(user.uid);
        const actualCheck = checkLimit("maxProjects", userProjects.length);

        if (!actualCheck.allowed) {
          toast.warning(
            `You have ${userProjects.length} projects. Upgrade to Pro for unlimited projects!`,
            "Project Limit Reached"
          );
          return;
        }

        // Show warning when close to limit
        if (!actualCheck.isUnlimited && actualCheck.remaining <= 1 && actualCheck.remaining > 0) {
          setTimeout(() => {
            toast.warning(`Only ${actualCheck.remaining} project slot left!`, "Almost at Limit");
          }, 500);
        }
      } catch (error) {
        console.error("Error checking project limit:", error);
      }
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
        toast.success("Project updated successfully!", "Success");
      } else {
        const newProjectId = await createProject(user.uid, name, projectRadii);
        setCurrentProject(newProjectId, name);
        toast.success("Project saved successfully!", "Success");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save project. Please try again.", "Save Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleNewProject = () => {
    clearRadii();
    clearProject();
    setProjectName("");
    setShareId(null);
    useSignalProcessingStore.getState().resetSignal();
    toast.success("New project started!");
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
    // ✅ Use centralized signal from signalProcessingStore
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

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      <header className="border-b border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-3 gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌊</span>
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

              {/* 3D Visualization Button */}
              <Button
                onClick={() => setShow3DModal(true)}
                variant="secondary"
                className="text-sm"
                title="View 3D Visualization"
                disabled={radii.length === 0}
              >
                <Box size={14} className="mr-1" />
                3D
              </Button>
            </div>
          )}

          <UndoRedoIndicator />

          {/* Support Us Button */}
          <Link href="/support">
            <Button
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
            >
              <Heart size={16} className="text-pink-400" />
              <span className="hidden sm:inline">Support Us</span>
            </Button>
          </Link>

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
        <ResizableSidebar title="Parameters" icon={<Settings size={16} className="text-[#667eea]" />}>
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
              icon={<Sliders size={16} className="text-[#667eea]" />}
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
                    <FeatureGate feature="canUseFilters" showLockedOverlay>
                      <DigitalFilterPanel
                        onApplyFilter={handleApplyFilter}
                        onClearFilter={handleClearFilter}
                        isFilterApplied={isFilterApplied}
                        sampleRate={settings.signalSampleRate || 30}
                      />
                    </FeatureGate>
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
                  <FeatureGate feature="canUseFFT" showLockedOverlay>
                    <FrequencyPanel />
                  </FeatureGate>
                </div>
              )}
            </AccordionItem>
          </div>

          {/* Formula Panel */}
          <div
            className={
              openPanel === "formula"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-shrink-0"
            }
          >
            <AccordionItem
              title="Formula"
              icon={<FunctionSquare size={16} className="text-[#667eea]" />}
              isOpen={openPanel === "formula"}
              onToggle={() => handleToggle("formula")}
            >
              {openPanel === "formula" && (
                <div className="h-full overflow-y-auto custom-scrollbar px-3 pb-3">
                  <FormulaDisplay radii={radii.map((r) => ({
                    frequency: r.direction === "counterclockwise" ? r.rotationSpeed : -r.rotationSpeed,
                    amplitude: r.length,
                    phase: r.initialAngle,
                  }))} />
                </div>
              )}
            </AccordionItem>
          </div>
        </ResizableSidebar>

        {/* Right workspace - IMPROVED RESPONSIVE */}
        <div className="flex-1 grid grid-rows-[auto_2fr_1fr] gap-3 min-w-0 min-h-0">
          {/* Control Panel */}
          <div className="flex-shrink-0">
            <ControlPanel />
          </div>

          {/* Visualization Canvas - 2/3 of space, min height */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[200px] overflow-hidden">
            <FullscreenWrapper>
              <VisualizationCanvas />
            </FullscreenWrapper>
          </div>

          {/* Signal Graphs - 1/3 of space, responsive columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 min-h-[100px]">
            {/* Original Signal */}
            {showOriginalSignal && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[80px] overflow-hidden">
                <FullscreenWrapper>
                  <SignalGraph />
                </FullscreenWrapper>
              </div>
            )}

            {/* Noisy Signal */}
            {showNoisySignal && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[80px] overflow-hidden">
                <FullscreenWrapper>
                  <NoisySignalGraph />
                </FullscreenWrapper>
              </div>
            )}

            {/* Filtered Signal */}
            {showFilteredSignal && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[80px] overflow-hidden">
                <FullscreenWrapper>
                  <FilteredSignalGraph />
                </FullscreenWrapper>
              </div>
            )}

            {/* Spectrum */}
            {showSpectrum && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[80px] overflow-hidden">
                <FullscreenWrapper>
                  <SpectrumGraphPanel />
                </FullscreenWrapper>
              </div>
            )}

            {/* Decomposition */}
            {showDecomposition && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-[80px] overflow-hidden">
                <FullscreenWrapper>
                  <DecompositionGraph />
                </FullscreenWrapper>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {editingRadius && (
        <RadiusEditor
          radius={editingRadius}
          onClose={() => setEditingRadius(null)}
        />
      )}

      {/* 3D Visualization Modal */}
      {show3DModal && radii.length > 0 && (
        <Visualization3DModal
          radii={radii.map((r) => ({
            frequency: r.direction === "counterclockwise" ? r.rotationSpeed : -r.rotationSpeed,
            amplitude: r.length,
            phase: r.initialAngle,
          }))}
          onClose={() => setShow3DModal(false)}
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
