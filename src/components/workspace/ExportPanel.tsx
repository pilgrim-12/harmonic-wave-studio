"use client";

import React from "react";
import { FileJson, FileSpreadsheet, Image as ImageIcon, Lock } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import {
  exportProjectJSON,
  exportCanvasPNG,
  exportSignalCSV,
} from "@/lib/export/exporter";
import { Button } from "@/components/ui/Button";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useUpgradeModal } from "@/components/tier/UpgradeModalProvider";

export const ExportPanel: React.FC = () => {
  const { radii } = useRadiusStore();
  const { settings, signalData } = useSimulationStore();
  const { hasAccess } = useTierCheck("canExport");
  const { showUpgradeModal } = useUpgradeModal();

  const handleExportJSON = () => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    if (radii.length === 0) {
      alert("No radii to export. Please add some radii first.");
      return;
    }
    exportProjectJSON(radii, settings);
  };

  const handleExportCSV = () => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    if (signalData.length === 0) {
      alert("No signal data to export. Please start the animation first!");
      return;
    }
    exportSignalCSV(signalData);
  };

  const handleExportPNG = () => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) {
      alert("Canvas not found. Please make sure the visualization is running.");
      return;
    }
    exportCanvasPNG(canvas);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={handleExportJSON}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title={hasAccess ? "Export project as JSON" : "Sign in to export"}
      >
        {!hasAccess && <Lock size={12} className="text-gray-500" />}
        <FileJson size={14} />
        JSON
      </Button>

      <Button
        onClick={handleExportCSV}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title={hasAccess ? "Export signal data as CSV" : "Sign in to export"}
      >
        {!hasAccess && <Lock size={12} className="text-gray-500" />}
        <FileSpreadsheet size={14} />
        CSV
      </Button>

      <Button
        onClick={handleExportPNG}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title={hasAccess ? "Export canvas as PNG" : "Sign in to export"}
      >
        {!hasAccess && <Lock size={12} className="text-gray-500" />}
        <ImageIcon size={14} />
        PNG
      </Button>
    </div>
  );
};
