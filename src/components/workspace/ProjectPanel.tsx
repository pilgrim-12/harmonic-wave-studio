"use client";

import React, { useRef, useState } from "react";
import { Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { SaveProjectDialog } from "./SaveProjectDialog";
import { useToast } from "@/contexts/ToastContext";
import { normalizeRadius } from "@/lib/validation/normalizeRadius";

interface ProjectRadiusData {
  id: string;
  name: string;
  parentId: string | null;
  length: number;
  initialAngle: number;
  rotationSpeed: number;
  direction: "clockwise" | "counterclockwise";
  color: string;
  order: number;
}

interface ProjectData {
  version: string;
  name: string;
  created: string;
  radii: ProjectRadiusData[];
}

export const ProjectPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { radii, clearRadii, addRadius, selectRadius } = useRadiusStore();
  const { setActiveTrackingRadius } = useSimulationStore();
  const toast = useToast();

  /**
   * Save current project to JSON file
   */
  const handleSaveProject = (projectName: string) => {
    // Create project data
    const project: ProjectData = {
      version: "1.0",
      name: projectName,
      created: new Date().toISOString(),
      radii: radii.map((r) => ({
        id: r.id,
        name: r.name,
        parentId: r.parentId,
        length: r.length,
        initialAngle: r.initialAngle,
        rotationSpeed: r.rotationSpeed,
        direction: r.direction,
        color: r.color,
        order: r.order,
      })),
    };

    // Convert to JSON
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create safe filename
    const safeFilename = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const timestamp = Date.now();

    // Download file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilename}_${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);

    toast.success(
      `Project saved! ${radii.length} radii exported to ${safeFilename}_${timestamp}.json`,
      `${projectName}`
    );
  };

  /**
   * Show save dialog
   */
  const handleSaveClick = () => {
    if (radii.length === 0) {
      toast.warning("No radii to save! Add some radii first.");
      return;
    }
    setShowSaveDialog(true);
  };

  /**
   * Load project from JSON file
   */
  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      toast.error("Invalid file type! Please select a .json file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const project: ProjectData = JSON.parse(json);

        // Validate project structure
        if (
          !project.version ||
          !project.radii ||
          !Array.isArray(project.radii)
        ) {
          throw new Error("Invalid project file structure");
        }

        // Check version compatibility - just show warning but continue
        if (project.version !== "1.0") {
          toast.warning(
            `Version mismatch (${project.version}). Project might not load correctly.`,
            "Version Warning"
          );
        }

        // Clear existing radii
        clearRadii();

        // Load radii from project
        // Sort by order to maintain hierarchy
        const sortedRadii = [...project.radii].sort(
          (a, b) => a.order - b.order
        );

        // ✨ FIX: Map old IDs to new IDs
        const idMap = new Map<string, string>();
        let lastRadiusId: string | null = null;

        sortedRadii.forEach((radiusData) => {
          // Get mapped parent ID
          const mappedParentId = radiusData.parentId
            ? idMap.get(radiusData.parentId) || null
            : null;

          // Normalize values before adding
          const normalized = normalizeRadius({
            length: radiusData.length,
            initialAngle: radiusData.initialAngle,
            rotationSpeed: radiusData.rotationSpeed,
          });

          // Add radius and get new ID
          const newId = addRadius({
            parentId: mappedParentId,
            length: normalized.length,
            initialAngle: normalized.initialAngle,
            rotationSpeed: normalized.rotationSpeed,
            direction: radiusData.direction,
            color: radiusData.color,
          });

          // Store mapping: old ID → new ID
          idMap.set(radiusData.id, newId);

          // Track last radius
          lastRadiusId = newId;
        });

        // ✨ Select and track the last radius after ensuring all radii are loaded
        if (lastRadiusId) {
          const finalRadiusId = lastRadiusId;
          // Use setTimeout to ensure radii are fully loaded before selecting
          setTimeout(() => {
            selectRadius(finalRadiusId);
            setActiveTrackingRadius(finalRadiusId);
          }, 100);

          // Автоматически включаем траекторию с дополнительной задержкой
          setTimeout(() => {
            const { toggleTrailTracking } = useSimulationStore.getState();
            toggleTrailTracking(finalRadiusId);
          }, 250);
        }

        toast.success(
          `Loaded ${project.radii.length} radii from ${project.name}`,
          "Project Loaded"
        );
      } catch (error) {
        console.error("Failed to load project:", error);
        toast.error(
          `Failed to load project: ${error instanceof Error ? error.message : "Unknown error"}`,
          "Load Error"
        );
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file!");
    };

    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Trigger file input
   */
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadProject}
        style={{ display: "none" }}
      />

      {/* Save button */}
      <Button
        onClick={handleSaveClick}
        variant="secondary"
        size="sm"
        title="Save project to JSON file"
        disabled={radii.length === 0}
      >
        <Save size={14} className="mr-1" />
        Save
      </Button>

      {/* Load button */}
      <Button
        onClick={handleLoadClick}
        variant="secondary"
        size="sm"
        title="Load project from JSON file"
      >
        <FolderOpen size={14} className="mr-1" />
        Load
      </Button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <SaveProjectDialog
          onSave={handleSaveProject}
          onClose={() => setShowSaveDialog(false)}
          defaultName={`Wave Pattern ${new Date().toLocaleDateString()}`}
        />
      )}
    </div>
  );
};
