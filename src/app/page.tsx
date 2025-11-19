"use client";

import { useState, useEffect } from "react";
import { ControlPanel } from "@/components/workspace/ControlPanel";
import { VisualizationCanvas } from "@/components/workspace/VisualizationCanvas";
import { SignalGraph } from "@/components/workspace/SignalGraph";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { FrequencyPanel } from "@/components/analysis/FrequencyPanel";
import { NoisePanel } from "@/components/signal/NoisePanel";
import { MetricsPanel } from "@/components/signal/MetricsPanel";
import { NoisySignalGraph } from "@/components/signal/NoisySignalGraph";
import { UndoRedoIndicator } from "@/components/ui/UndoRedoIndicator";
import { AccordionItem } from "@/components/ui/Accordion";
import {
  Settings,
  Plus,
  BarChart3,
  Wand2,
  Save,
  FilePlus,
  Activity,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { RadiusItem } from "@/components/workspace/RadiusItem";
import { RadiusEditor } from "@/components/workspace/RadiusEditor";
import { Button } from "@/components/ui/Button";
import { Radius } from "@/types/radius";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, updateProject } from "@/services/projectService";
import { ShareButton } from "@/components/share/ShareButton"; // ✅ ДОБАВЛЕНО

export default function Home() {
  const [openPanel, setOpenPanel] = useState<string>("radii");
  const [editingRadius, setEditingRadius] = useState<Radius | null>(null);
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null); // ✅ ДОБАВЛЕНО

  const { radii, addRadius, selectRadius, updateRadius, clearRadii } =
    useRadiusStore();
  const { setActiveTrackingRadius, play } = useSimulationStore();
  const {
    currentProjectId,
    currentProjectName,
    setCurrentProject,
    clearProject,
  } = useProjectStore();
  const { user, loading } = useAuth();

  useKeyboardShortcuts();

  // Синхронизация имени проекта
  useEffect(() => {
    if (currentProjectName) {
      setProjectName(currentProjectName);
    }
  }, [currentProjectName]);

  // ✅ АВТОСТАРТ: Запускаем анимацию когда загружены радиусы
  useEffect(() => {
    if (radii.length > 0) {
      setTimeout(() => play(), 100);
    }
  }, [radii.length, play]);

  // ✅ ИСПРАВЛЕНО: Плавное обновление сигнала через requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 1000 / 30; // 30 FPS

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
          `• Angles → [0°, 360°]\n` +
          `• Speeds → [0.1, 10.0]\n` +
          `• Lengths → [5, 200]px`
      );
    } else {
      alert("✨ All radii are already normalized!");
    }
  };

  const handleNewProject = () => {
    if (radii.length > 0 || projectName.trim()) {
      if (!confirm("Clear current project and start new?")) {
        return;
      }
    }

    clearRadii();
    setProjectName("");
    setShareId(null); // ✅ ДОБАВЛЕНО
    clearProject();
  };

  const handleSaveProject = async () => {
    if (!user) {
      alert("Please sign in to save projects");
      return;
    }

    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    if (radii.length === 0) {
      alert("Add at least one radius before saving");
      return;
    }

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
        await updateProject(currentProjectId, projectName, projectRadii);
        alert("✅ Project updated!");
      } else {
        const projectId = await createProject(
          user.uid,
          projectName,
          projectRadii
        );
        setCurrentProject(projectId, projectName, projectRadii);
        alert("✅ Project saved!");
      }
    } catch (error) {
      console.error("❌ Error saving project:", error);
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  // ✅ ДОБАВЛЕНО: Handler для успешного share
  const handleShareSuccess = (newShareId: string) => {
    setShareId(newShareId || null);
  };

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col p-3">
      {/* Header */}
      <header className="mb-2 flex items-center justify-between flex-shrink-0">
        <h1 className="text-base font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🌊 Harmonic Wave Studio
        </h1>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="px-3 py-1.5 text-sm rounded-lg bg-[#1a1a1a] text-white border border-[#2a2a2a] focus:border-[#667eea] focus:outline-none"
              />
              <Button
                onClick={handleNewProject}
                variant="secondary"
                className="text-sm"
                title="Start new project"
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

              {/* ✅ ДОБАВЛЕНО: Share Button */}
              {currentProjectId && (
                <ShareButton
                  projectId={currentProjectId}
                  projectName={projectName}
                  isShared={!!shareId}
                  shareId={shareId}
                  onShareSuccess={handleShareSuccess}
                />
              )}
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
        <div className="w-[260px] flex flex-col gap-3 flex-shrink-0 overflow-hidden">
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
                <div className="overflow-y-auto custom-scrollbar px-3 pb-3 space-y-3">
                  <NoisePanel />
                  <MetricsPanel />
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
        </div>

        {/* Right workspace */}
        <div className="flex-1 grid grid-rows-[auto_1fr_1fr_1fr] gap-3 min-w-0 min-h-0">
          <div className="flex-shrink-0">
            <ControlPanel />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <VisualizationCanvas />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <SignalGraph />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] min-h-0 overflow-hidden">
            <NoisySignalGraph />
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
