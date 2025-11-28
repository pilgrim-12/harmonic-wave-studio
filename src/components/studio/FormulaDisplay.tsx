"use client";

import React, { useMemo, useState } from "react";
import { Radius } from "@/services/projectService";
import { Button } from "@/components/ui/Button";
import { Copy, X, FunctionSquare } from "lucide-react";

interface FormulaDisplayProps {
  radii: Radius[];
  onClose?: () => void;
}

type FormatType = "plain" | "latex" | "mathematica";

/**
 * Displays the mathematical formula for the harmonic wave signal
 */
export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  radii,
  onClose,
}) => {
  const [format, setFormat] = useState<FormatType>("plain");
  const [copied, setCopied] = useState(false);

  // Generate formula in different formats
  const formula = useMemo(() => {
    const activeRadii = radii.filter((r) => r.frequency !== 0);

    if (activeRadii.length === 0) {
      return {
        plain: "y(t) = 0",
        latex: "y(t) = 0",
        mathematica: "y[t_] := 0",
      };
    }

    const terms = activeRadii.map((r) => {
      const A = r.amplitude.toFixed(3);
      const f = r.frequency.toFixed(3);
      const φ = r.phase.toFixed(3);

      return {
        plain: `${A} * sin(2π * ${f} * t + ${φ})`,
        latex: `${A} \\sin(2\\pi \\cdot ${f} \\cdot t + ${φ})`,
        mathematica: `${A} * Sin[2 * Pi * ${f} * t + ${φ}]`,
      };
    });

    return {
      plain: `y(t) = ${terms.map((t) => t.plain).join(" + ")}`,
      latex: `y(t) = ${terms.map((t) => t.latex).join(" + ")}`,
      mathematica: `y[t_] := ${terms.map((t) => t.mathematica).join(" + ")}`,
    };
  }, [radii]);

  const handleCopy = () => {
    const textToCopy = formula[format];
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFormula = formula[format];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunctionSquare size={16} className="text-[#667eea]" />
          <h3 className="text-sm font-semibold text-white">
            Signal Formula
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Format Selector */}
      <div className="flex gap-1">
        <button
          onClick={() => setFormat("plain")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            format === "plain"
              ? "bg-[#667eea] text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:text-white"
          }`}
        >
          Plain Text
        </button>
        <button
          onClick={() => setFormat("latex")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            format === "latex"
              ? "bg-[#667eea] text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:text-white"
          }`}
        >
          LaTeX
        </button>
        <button
          onClick={() => setFormat("mathematica")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            format === "mathematica"
              ? "bg-[#667eea] text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:text-white"
          }`}
        >
          Mathematica
        </button>
      </div>

      {/* Formula Display */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
        <pre className="whitespace-pre-wrap break-all">{currentFormula}</pre>
      </div>

      {/* Info Text */}
      <div className="text-[10px] text-gray-500 space-y-1">
        <p>
          <strong className="text-gray-400">Where:</strong>
        </p>
        <ul className="ml-3 space-y-0.5">
          <li>• t = time in seconds</li>
          <li>• A = amplitude (vector length)</li>
          <li>• f = frequency in Hz (rotation speed)</li>
          <li>• φ = phase in radians (initial angle)</li>
        </ul>
      </div>

      {/* Copy Button */}
      <Button
        onClick={handleCopy}
        variant={copied ? "primary" : "secondary"}
        size="sm"
        className="w-full"
      >
        <Copy size={14} className="mr-2" />
        {copied ? "Copied!" : "Copy Formula"}
      </Button>
    </div>
  );
};
