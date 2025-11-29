"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Image as ImageIcon, Film, Lock } from "lucide-react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import {
  exportCanvasPNG,
  exportSignalCSV,
} from "@/lib/export/exporter";
import { Button } from "@/components/ui/Button";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useUpgradeModal } from "@/components/tier/UpgradeModalProvider";
import { useToast } from "@/contexts/ToastContext";
import { GifExportModal } from "./GifExportModal";

export const ExportPanel: React.FC = () => {
  const { hasAccess } = useTierCheck("canExport");
  const { showUpgradeModal } = useUpgradeModal();
  const toast = useToast();
  const [showGifModal, setShowGifModal] = useState(false);

  const handleExportCSV = () => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    // ✅ Use centralized signal from signalProcessingStore
    const { signalBuffer } = useSignalProcessingStore.getState();

    if (signalBuffer.length === 0) {
      toast.warning("No signal data to export. Please start the animation first!");
      return;
    }
    exportSignalCSV(signalBuffer);
  };

  const handleExportPNG = () => {
    // ✅ Block for Anonymous users
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Canvas not found. Please make sure the visualization is running.");
      return;
    }
    exportCanvasPNG(canvas);
  };

  const handleExportGIF = () => {
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Canvas not found. Please make sure the visualization is visible.");
      return;
    }

    setShowGifModal(true);
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
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

        <Button
          onClick={handleExportGIF}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1.5"
          title={hasAccess ? "Export animation as GIF" : "Sign in to export"}
        >
          {!hasAccess && <Lock size={12} className="text-gray-500" />}
          <Film size={14} />
          GIF
        </Button>
      </div>

      <GifExportModal
        isOpen={showGifModal}
        onClose={() => setShowGifModal(false)}
      />
    </>
  );
};
