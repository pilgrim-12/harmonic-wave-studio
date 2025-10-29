"use client";

import { RadiusPanel } from "@/components/workspace/RadiusPanel";
import { ControlPanel } from "@/components/workspace/ControlPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🌊 Harmonic Wave Studio
        </h1>
        <p className="text-gray-400 mt-2">
          Visualize, Analyze, Filter - Signal Processing with Epicycles
        </p>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-[320px_1fr] gap-6 max-w-[1600px] mx-auto">
        {/* Left panel */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
          <RadiusPanel />
        </div>

        {/* Right workspace */}
        <div className="space-y-6">
          {/* Control panel */}
          <ControlPanel />

          {/* Visualization placeholder */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a] h-[500px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-lg">Визуализация радиусов</p>
              <p className="text-sm mt-2">Canvas будет здесь</p>
            </div>
          </div>

          {/* Graph placeholder */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a] h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">График сигнала</p>
              <p className="text-sm mt-2">Real-time график будет здесь</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
