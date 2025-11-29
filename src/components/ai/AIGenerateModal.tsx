"use client";

import React, { useState, useCallback } from "react";
import { X, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  generatePattern,
  GeneratedPattern,
  ProgressCallback,
} from "@/lib/ai/patternGenerator";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (pattern: GeneratedPattern) => void;
}

// Example prompts
const EXAMPLE_PROMPTS = [
  "цветок с 5 лепестками",
  "спираль галактики",
  "сердце",
  "звезда",
  "бабочка",
  "пульс",
  "хаос",
  "волна океана",
];

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number | undefined>();

  const handleProgress: ProgressCallback = useCallback((p) => {
    setStatus(p.message);
    setProgress(p.progress);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setStatus("Starting...");

    try {
      const pattern = await generatePattern(prompt.trim(), handleProgress);
      onGenerate(pattern);
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(undefined);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] w-[480px] max-w-[95vw] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="text-white font-medium">AI Pattern Generator</h2>
            <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
              Beta
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Опишите паттерн, который хотите создать:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Например: цветок с 5 лепестками, спираль галактики, сердце..."
              disabled={isGenerating}
              className="w-full h-24 px-3 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          {/* Example prompts */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Примеры:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#333] text-gray-400 hover:text-white rounded transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Status/Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin text-purple-400" />
                <span>{status}</span>
              </div>
              {progress !== undefined && (
                <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 bg-[#252525] rounded-lg p-3">
            <p>
              <strong className="text-gray-400">Как это работает:</strong>
            </p>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>Поддерживаются описания на русском и английском</li>
              <li>Можно указать количество: "5 лепестков", "7-конечная звезда"</li>
              <li>AI модель загружается при первом использовании (~50MB)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#333]">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            disabled={isGenerating}
          >
            Отмена
          </Button>
          <Button
            onClick={handleGenerate}
            variant="primary"
            size="sm"
            disabled={isGenerating || !prompt.trim()}
            className="min-w-[120px]"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                Генерация...
              </>
            ) : (
              <>
                <Wand2 size={14} className="mr-1" />
                Создать
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
