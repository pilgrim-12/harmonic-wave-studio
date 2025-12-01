"use client";

import React, { useState, useMemo } from "react";
import { X, Calculator, Check, AlertCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRadiusStore } from "@/store/radiusStore";
import { useSimulationStore } from "@/store/simulationStore";
import { useProjectStore } from "@/store/useProjectStore";
import {
  parseFormula,
  termsToRadii,
  FORMULA_EXAMPLES,
  ParseResult,
} from "@/lib/formula/formulaParser";

interface FormulaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaImportModal: React.FC<FormulaImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formula, setFormula] = useState("");
  const [showExamples, setShowExamples] = useState(true);

  const { clearRadii, addRadius, selectRadius } = useRadiusStore();
  const { setCurrentProject } = useProjectStore();

  // Parse formula in real-time for preview
  const parseResult: ParseResult = useMemo(() => {
    if (!formula.trim()) {
      return { success: false, terms: [], error: "Enter a formula", originalFormula: "" };
    }
    return parseFormula(formula);
  }, [formula]);

  const radiiPreview = useMemo(() => {
    if (!parseResult.success) return [];
    return termsToRadii(parseResult.terms);
  }, [parseResult]);

  const handleImport = () => {
    if (!parseResult.success || radiiPreview.length === 0) return;

    // Clear existing radii
    clearRadii();

    // Add radii sequentially (linear chain)
    let parentId: string | null = null;
    let lastRadiusId: string | null = null;

    radiiPreview.forEach((radiusData) => {
      // Convert degrees to radians (formula parser returns degrees, store uses radians)
      const initialAngleRadians = (radiusData.initialAngle * Math.PI) / 180;

      const newRadiusId = addRadius({
        parentId,
        length: radiusData.length,
        initialAngle: initialAngleRadians,
        rotationSpeed: radiusData.rotationSpeed,
        direction: radiusData.direction,
        color: radiusData.color,
      });

      lastRadiusId = newRadiusId;
      parentId = newRadiusId;
    });

    // Auto-select and track the last radius
    if (lastRadiusId) {
      const radiusIdToSelect = lastRadiusId;
      requestAnimationFrame(() => {
        selectRadius(radiusIdToSelect);
        useSimulationStore.getState().setActiveTrackingRadius(radiusIdToSelect);
        useSimulationStore.getState().toggleTrailTracking(radiusIdToSelect);
      });
    }

    // Set formula as project name
    setCurrentProject(null, `Formula: ${formula.substring(0, 30)}${formula.length > 30 ? "..." : ""}`);

    onClose();
  };

  const handleExampleClick = (exampleFormula: string) => {
    setFormula(exampleFormula);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] w-[500px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#667eea]" />
            <h2 className="text-white font-medium">Import from Formula</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Formula input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Fourier Series Formula
            </label>
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., sin(t) + 0.5*sin(2t) + 0.33*sin(3t)"
              className="w-full h-24 bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-[#667eea] placeholder:text-gray-600"
              spellCheck={false}
            />
          </div>

          {/* Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            parseResult.success
              ? "bg-green-500/10 border border-green-500/30"
              : formula.trim()
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-[#252525] border border-[#333]"
          }`}>
            {parseResult.success ? (
              <>
                <Check size={16} className="text-green-400" />
                <span className="text-green-400 text-sm">
                  Parsed {parseResult.terms.length} term{parseResult.terms.length !== 1 ? "s" : ""}
                </span>
              </>
            ) : formula.trim() ? (
              <>
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm">{parseResult.error}</span>
              </>
            ) : (
              <>
                <Calculator size={16} className="text-gray-500" />
                <span className="text-gray-500 text-sm">Enter a formula above</span>
              </>
            )}
          </div>

          {/* Preview */}
          {parseResult.success && radiiPreview.length > 0 && (
            <div className="bg-[#252525] rounded-lg p-3">
              <h4 className="text-xs font-semibold text-[#667eea] mb-2">
                Preview ({radiiPreview.length} radii)
              </h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {radiiPreview.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs bg-[#1a1a1a] rounded p-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: r.color }}
                    />
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-gray-500">Amp:</span>{" "}
                        <span className="text-white">{r.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Freq:</span>{" "}
                        <span className="text-white">{r.rotationSpeed}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phase:</span>{" "}
                        <span className="text-white">{r.initialAngle}°</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Dir:</span>{" "}
                        <span className="text-white">
                          {r.direction === "counterclockwise" ? "CCW" : "CW"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples section */}
          <div className="border-t border-[#333] pt-3">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
            >
              <Sparkles size={14} className="text-[#667eea]" />
              <span>Example Formulas</span>
              {showExamples ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showExamples && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {FORMULA_EXAMPLES.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example.formula)}
                    className="flex items-center justify-between px-3 py-2 bg-[#252525] hover:bg-[#2a2a2a] rounded-lg text-left transition-colors group"
                  >
                    <div>
                      <code className="text-[#667eea] text-xs font-mono">
                        {example.formula}
                      </code>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {example.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-[#667eea] transition-colors">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Syntax help */}
          <div className="bg-[#0f0f0f] rounded-lg p-3 text-xs text-gray-500">
            <div className="font-semibold text-gray-400 mb-1">Syntax:</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="text-[#667eea]">sin(t)</code> - sine wave at 1 Hz</li>
              <li><code className="text-[#667eea]">A*sin(n*t)</code> - amplitude A, frequency n</li>
              <li><code className="text-[#667eea]">sin(t+45)</code> - phase offset in degrees</li>
              <li><code className="text-[#667eea]">cos(t)</code> - same as sin(t+90)</li>
              <li><code className="text-[#667eea]">-sin(t)</code> - reversed direction</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#333]">
          <Button onClick={onClose} variant="secondary" size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="primary"
            size="sm"
            disabled={!parseResult.success || radiiPreview.length === 0}
            className="min-w-[100px]"
          >
            <Calculator size={14} className="mr-1" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
};
