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
 * Now includes modulation effects (Envelope, LFO, Sweep)
 */
export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  radii,
  onClose,
}) => {
  const [format, setFormat] = useState<FormatType>("plain");
  const [copied, setCopied] = useState(false);

  // Check for any modulation
  const hasModulation = useMemo(() => {
    return radii.some(
      (r) =>
        r.envelope?.enabled ||
        r.lfo?.enabled ||
        r.sweep?.enabled ||
        r.timeline?.enabled
    );
  }, [radii]);

  // Generate formula in different formats
  const formula = useMemo(() => {
    const activeRadii = radii.filter((r) => r.frequency !== 0 || r.amplitude !== 0);

    if (activeRadii.length === 0) {
      return {
        plain: "y(t) = 0",
        latex: "y(t) = 0",
        mathematica: "y[t_] := 0",
      };
    }

    const terms = activeRadii.map((r, idx) => {
      const A = r.amplitude.toFixed(3);
      const f = r.frequency.toFixed(3);
      const φ = r.phase.toFixed(3);

      // Check modulation for this radius
      const hasEnv = r.envelope?.enabled;
      const hasLfo = r.lfo?.enabled;
      const hasSweep = r.sweep?.enabled;

      // Build amplitude part
      let ampPart = A;
      if (hasEnv) {
        ampPart = `E${idx + 1}(t) * ${A}`;
      }
      if (hasLfo && r.lfo?.target === "amplitude") {
        const depth = r.lfo.depth.toFixed(2);
        ampPart = `${ampPart} * (1 + ${depth} * LFO${idx + 1}(t))`;
      }

      // Build frequency part
      let freqPart = f;
      if (hasSweep) {
        freqPart = `f${idx + 1}(t)`;
      }
      if (hasLfo && r.lfo?.target === "frequency") {
        const depth = r.lfo.depth.toFixed(2);
        freqPart = `${freqPart} * (1 + ${depth} * LFO${idx + 1}(t))`;
      }

      // Build phase part
      let phasePart = φ;
      if (hasLfo && r.lfo?.target === "phase") {
        const depth = r.lfo.depth.toFixed(2);
        phasePart = `${φ} + ${depth} * π * LFO${idx + 1}(t)`;
      }

      return {
        plain: `${ampPart} * sin(2π * ${freqPart} * t + ${phasePart})`,
        latex: `${ampPart.replace(/\*/g, " \\cdot ")} \\sin(2\\pi \\cdot ${freqPart.replace(/\*/g, " \\cdot ")} \\cdot t + ${phasePart.replace(/\*/g, " \\cdot ").replace(/π/g, "\\pi")})`,
        mathematica: `${ampPart} * Sin[2 * Pi * ${freqPart} * t + ${phasePart.replace(/π/g, "Pi")}]`,
      };
    });

    return {
      plain: `y(t) = ${terms.map((t) => t.plain).join(" + ")}`,
      latex: `y(t) = ${terms.map((t) => t.latex).join(" + ")}`,
      mathematica: `y[t_] := ${terms.map((t) => t.mathematica).join(" + ")}`,
    };
  }, [radii]);

  // Generate modulation descriptions
  const modulationInfo = useMemo(() => {
    const info: string[] = [];

    radii.forEach((r, idx) => {
      const radiusNum = idx + 1;

      if (r.envelope?.enabled) {
        const { attack, decay, sustain, release } = r.envelope;
        info.push(
          `E${radiusNum}(t) = ADSR envelope (A=${attack}s, D=${decay}s, S=${sustain}, R=${release}s)`
        );
      }

      if (r.lfo?.enabled) {
        const { waveform, rate, depth, target } = r.lfo;
        info.push(
          `LFO${radiusNum}(t) = ${waveform} wave at ${rate}Hz, depth=${(depth * 100).toFixed(0)}% → ${target}`
        );
      }

      if (r.sweep?.enabled) {
        const { startFreq, endFreq, duration, loop } = r.sweep;
        info.push(
          `f${radiusNum}(t) = frequency sweep ${startFreq}Hz → ${endFreq}Hz over ${duration}s${loop ? " (loop)" : ""}`
        );
      }

      if (r.timeline?.enabled) {
        const trackCount = r.timeline.tracks.filter((t) => t.enabled).length;
        info.push(
          `Radius ${radiusNum}: ${trackCount} timeline track(s) over ${r.timeline.duration}s`
        );
      }
    });

    return info;
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
          {hasModulation && (
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px]">
              MOD
            </span>
          )}
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

      {/* Modulation Info */}
      {modulationInfo.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded p-2 space-y-1">
          <p className="text-[10px] font-semibold text-orange-400">
            Modulation Functions:
          </p>
          {modulationInfo.map((info, idx) => (
            <p key={idx} className="text-[10px] text-orange-300/80 font-mono">
              • {info}
            </p>
          ))}
        </div>
      )}

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
          {hasModulation && (
            <>
              <li>• E(t) = envelope multiplier (0 to 1)</li>
              <li>• LFO(t) = low frequency oscillator (-1 to 1)</li>
            </>
          )}
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
