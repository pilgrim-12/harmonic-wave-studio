"use client";

import React from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useRadiusStore } from "@/store/radiusStore";
import { cn } from "@/lib/utils";

export const UndoRedoIndicator: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useRadiusStore();

  return (
    <div className="flex items-center gap-1">
      {/* Undo button */}
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center gap-1.5",
          canUndo()
            ? "bg-[#2a2a2a] hover:bg-[#333] text-gray-300 cursor-pointer"
            : "bg-[#1a1a1a] text-gray-600 cursor-not-allowed opacity-50"
        )}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={14} />
        <span className="text-xs font-medium">Undo</span>
      </button>

      {/* Redo button */}
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center gap-1.5",
          canRedo()
            ? "bg-[#2a2a2a] hover:bg-[#333] text-gray-300 cursor-pointer"
            : "bg-[#1a1a1a] text-gray-600 cursor-not-allowed opacity-50"
        )}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
      >
        <Redo2 size={14} />
        <span className="text-xs font-medium">Redo</span>
      </button>

      {/* Keyboard shortcut hint */}
      <div className="ml-2 text-[10px] text-gray-500 hidden sm:block">
        <span className="font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded">
          Ctrl+Z
        </span>
        {" / "}
        <span className="font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded">
          Ctrl+Y
        </span>
      </div>
    </div>
  );
};
