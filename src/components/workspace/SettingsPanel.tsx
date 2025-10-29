"use client";

import React from "react";
import { Settings, Grid3x3, Axis3d, PenLine } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Slider } from "@/components/ui/Slider";

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useSimulationStore();

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#667eea]">
        <Settings size={20} className="text-[#667eea]" />
        <h2 className="text-lg font-bold text-[#667eea]">
          Настройки визуализации
        </h2>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        {/* Show Grid */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3x3 size={18} className="text-gray-400" />
            <span className="text-sm text-gray-300">Показать сетку</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => updateSettings({ showGrid: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#252525] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#667eea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
          </label>
        </div>

        {/* Grid Size */}
        {settings.showGrid && (
          <div className="ml-7">
            <Slider
              label="Размер сетки"
              min={20}
              max={100}
              step={10}
              value={settings.gridSize}
              onChange={(e) =>
                updateSettings({ gridSize: Number(e.target.value) })
              }
              valueFormatter={(v) => `${v}px`}
            />
          </div>
        )}

        {/* Show Axes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Axis3d size={18} className="text-gray-400" />
            <span className="text-sm text-gray-300">Показать оси</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAxes}
              onChange={(e) => updateSettings({ showAxes: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#252525] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#667eea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
          </label>
        </div>

        {/* Show Trail */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine size={18} className="text-gray-400" />
            <span className="text-sm text-gray-300">Показать след</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showTrail}
              onChange={(e) => updateSettings({ showTrail: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#252525] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#667eea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
          </label>
        </div>

        {/* Trail Length */}
        {settings.showTrail && (
          <div className="ml-7">
            <Slider
              label="Длина следа"
              min={50}
              max={500}
              step={50}
              value={settings.trailLength}
              onChange={(e) =>
                updateSettings({ trailLength: Number(e.target.value) })
              }
              valueFormatter={(v) => `${v} точек`}
            />
          </div>
        )}

        {/* Animation Speed */}
        <div className="pt-2 border-t border-[#2a2a2a]">
          <Slider
            label="Скорость анимации"
            min={0.1}
            max={3}
            step={0.1}
            value={settings.animationSpeed}
            onChange={(e) =>
              updateSettings({ animationSpeed: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v.toFixed(1)}x`}
          />
        </div>

        {/* Graph Duration */}
        <div>
          <Slider
            label="Длительность графика"
            min={5}
            max={30}
            step={1}
            value={settings.graphDuration}
            onChange={(e) =>
              updateSettings({ graphDuration: Number(e.target.value) })
            }
            valueFormatter={(v) => `${v}s`}
          />
        </div>
      </div>
    </div>
  );
};
