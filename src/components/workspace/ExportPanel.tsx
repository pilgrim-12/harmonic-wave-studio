"use client";

import React from "react";
import { FileSpreadsheet, Lock } from "lucide-react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";
import { exportSignalCSV } from "@/lib/export/exporter";
import { Button } from "@/components/ui/Button";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useUpgradeModal } from "@/components/tier/UpgradeModalProvider";
import { useToast } from "@/contexts/ToastContext";

export const ExportPanel: React.FC = () => {
  const { hasAccess } = useTierCheck("canExport");
  const { showUpgradeModal } = useUpgradeModal();
  const toast = useToast();

  const handleExportCSV = () => {
    if (!hasAccess) {
      showUpgradeModal("canExport");
      return;
    }

    const { signalBuffer } = useSignalProcessingStore.getState();

    if (signalBuffer.length === 0) {
      toast.warning("No signal data to export. Please start the animation first!");
      return;
    }
    exportSignalCSV(signalBuffer);
  };

  return (
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
    </div>
  );
};
