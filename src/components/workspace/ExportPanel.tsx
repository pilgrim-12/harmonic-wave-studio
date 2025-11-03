"use client";

import React from "react";
import { FileJson, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import {
  exportProjectJSON,
  exportCanvasPNG,
  exportSignalCSV,
} from "@/lib/export/exporter";
import { Button } from "@/components/ui/Button";

export const ExportPanel: React.FC = () => {
  const { radii } = useRadiusStore();
  const { settings, signalData } = useSimulationStore();

  const handleExportJSON = () => {
    if (radii.length === 0) {
      alert("No radii to export. Please add some radii first.");
      return;
    }
    exportProjectJSON(radii, settings);
  };

  const handleExportCSV = () => {
    if (signalData.length === 0) {
      alert("No signal data to export. Please start the animation first!");
      return;
    }
    exportSignalCSV(signalData);
  };

  const handleExportPNG = () => {
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
        title="Export project as JSON"
      >
        <FileJson size={14} />
        JSON
      </Button>

      <Button
        onClick={handleExportCSV}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title="Export signal data as CSV"
      >
        <FileSpreadsheet size={14} />
        CSV
      </Button>

      <Button
        onClick={handleExportPNG}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title="Export canvas as PNG"
      >
        <ImageIcon size={14} />
        PNG
      </Button>
    </div>
  );
};
