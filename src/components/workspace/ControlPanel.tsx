"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  FilePlus,
  Save,
  Activity,
  LayoutGrid,
  Box,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { Button } from "@/components/ui/Button";
import { ExportPanel } from "./ExportPanel";
import { PresetPanel } from "./PresetPanel";
import { ProjectPanel } from "./ProjectPanel";
import { TrailLengthControl } from "@/components/settings/TrailLengthControl";
import { GraphVisibilityPanel } from "./GraphVisibilityPanel";
import { ShareButton } from "@/components/share/ShareButton";
import { User } from "firebase/auth";
import { UserProfile } from "@/types/user";
import { Radius } from "@/types/radius";

export interface ControlPanelProps {
  // Auth
  user: User | null;
  userProfile: UserProfile | null;
  // Project actions
  onNewProject: () => void;
  onSaveProject: () => void;
  saving: boolean;
  currentProjectId: string | null;
  projectName: string;
  // Share
  shareId: string | null;
  onShareSuccess: (shareId: string) => void;
  // Tools
  onOpenAnalysis: () => void;
  onOpen3D: () => void;
  // Data
  radii: Radius[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  user,
  userProfile,
  onNewProject,
  onSaveProject,
  saving,
  currentProjectId,
  projectName,
  shareId,
  onShareSuccess,
  onOpenAnalysis,
  onOpen3D,
  radii,
}) => {
  const { isPlaying, isPaused, play, pause, stop, clearTrails } =
    useSimulationStore();

  const handleClearTrails = () => {
    clearTrails();
    useSignalProcessingStore.getState().resetSignal();
  };

  const groupClass =
    "flex items-center gap-0.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-1";

  return (
    <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 md:py-1.5 bg-[#0f0f0f] border-b border-[#2a2a2a] flex-wrap">
      {/* Group 1: Playback */}
      <div className={groupClass}>
        {!isPlaying ? (
          <Button onClick={play} variant="primary" size="sm">
            <Play size={14} className="md:mr-1" />
            <span className="hidden md:inline">
              {isPaused ? "Resume" : "Start"}
            </span>
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" size="sm">
            <Pause size={14} className="md:mr-1" />
            <span className="hidden md:inline">Pause</span>
          </Button>
        )}
        <Button
          onClick={stop}
          variant="secondary"
          size="icon"
          title="Stop"
          disabled={!isPlaying && !isPaused}
        >
          <Square size={14} />
        </Button>
        <Button
          onClick={handleClearTrails}
          variant="secondary"
          size="icon"
          title="Reset trails & graphs"
        >
          <RotateCcw size={14} />
        </Button>
      </div>

      {/* Group 2: Project (auth-gated) */}
      {user && (
        <div className={groupClass}>
          <Button onClick={onNewProject} variant="secondary" size="icon" title="New project" className="md:!px-3 md:!py-1.5">
            <FilePlus size={14} />
            <span className="hidden md:inline ml-1">New</span>
          </Button>
          <Button
            data-tour="save-button"
            onClick={onSaveProject}
            disabled={saving}
            variant="primary"
            size="icon"
            title={saving ? "Saving..." : currentProjectId ? "Update project" : "Save project"}
            className="md:!px-3 md:!py-1.5"
          >
            <Save size={14} />
            <span className="hidden md:inline ml-1">
              {saving ? "..." : currentProjectId ? "Update" : "Save"}
            </span>
          </Button>
          {currentProjectId && (
            <ShareButton
              projectId={currentProjectId}
              projectName={projectName}
              isShared={!!shareId}
              shareId={shareId}
              onShareSuccess={onShareSuccess}
            />
          )}
        </div>
      )}

      {/* Group 3: Files */}
      <div className={groupClass}>
        <PresetPanel />
        <ProjectPanel />
        <ExportPanel />
      </div>

      {/* Group 4: Tools */}
      <div className={groupClass}>
        <Button
          onClick={onOpenAnalysis}
          variant="secondary"
          size="icon"
          title="Signal Analysis"
        >
          <Activity size={14} />
        </Button>
        <Link href="/gallery">
          <Button
            variant="secondary"
            size="icon"
            title="Community Gallery"
          >
            <LayoutGrid size={14} />
          </Button>
        </Link>
        {userProfile?.isAdmin && (
          <Button
            data-tour="3d-button"
            onClick={onOpen3D}
            variant="secondary"
            size="icon"
            title="3D Visualization"
            disabled={radii.length === 0}
          >
            <Box size={14} />
          </Button>
        )}
      </div>

      {/* Group 5: View */}
      <GraphVisibilityPanel />

      {/* Trail: flexible, hidden on very small screens */}
      <div className="hidden sm:flex flex-1 min-w-[140px]">
        <TrailLengthControl />
      </div>
    </div>
  );
};
