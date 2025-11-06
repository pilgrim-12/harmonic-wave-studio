"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SaveProjectDialogProps {
  onSave: (name: string) => void;
  onClose: () => void;
  defaultName?: string;
}

export const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  onSave,
  onClose,
  defaultName = "My Wave Pattern",
}) => {
  const [projectName, setProjectName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (projectName.trim()) {
      onSave(projectName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#667eea]">Save Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              autoFocus
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {projectName.length}/50 characters
            </p>
          </div>

          {/* Info */}
          <div className="bg-[#252525] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-xs text-gray-400">
              Your project will be saved as a JSON file with all radii and their
              parameters.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!projectName.trim()}
            >
              <Save size={14} className="mr-1" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
