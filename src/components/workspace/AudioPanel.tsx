"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignalAudioSynthesizer } from "@/lib/audio/synthesizer";
import { useSimulationStore } from "@/store/simulationStore";

// Musical notes frequencies (Hz)
const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
} as const;

export const AudioPanel: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNote, setSelectedNote] = useState<keyof typeof NOTES>("A4");
  const synthRef = useRef<SignalAudioSynthesizer | null>(null);
  const { signalData } = useSimulationStore(); // ⭐ NEW - Get real signal data

  useEffect(() => {
    // Initialize synthesizer
    synthRef.current = new SignalAudioSynthesizer();

    return () => {
      // Cleanup on unmount
      synthRef.current?.dispose();
    };
  }, []);

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.stop();
      setIsPlaying(false);
    } else {
      // Check if we have signal data
      if (signalData.length === 0) {
        alert("No signal data available. Please start the animation first!");
        return;
      }

      // ⭐ NEW - Use real signal data from store
      // Extract Y values and normalize them
      const yValues = signalData.map((point) => point.y);

      // Normalize to [-1, 1] range
      const maxAbs = Math.max(...yValues.map(Math.abs));
      const normalizedData = yValues.map((y) => y / (maxAbs || 1));

      // Take a reasonable sample (256-2048 points for best audio quality)
      const targetSamples = Math.min(1024, normalizedData.length);
      const sampledData = sampleData(normalizedData, targetSamples);

      const frequency = NOTES[selectedNote];

      synthRef.current.play(sampledData, frequency, 3); // Play for 3 seconds
      setIsPlaying(true);

      // Auto-update state when playback ends
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  // Helper function to sample data to target length
  const sampleData = (data: number[], targetLength: number): number[] => {
    if (data.length <= targetLength) return data;

    const result = new Array(targetLength);
    const step = data.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const index = Math.floor(i * step);
      result[i] = data[index];
    }

    return result;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Note selector */}
      <select
        value={selectedNote}
        onChange={(e) => setSelectedNote(e.target.value as keyof typeof NOTES)}
        className="px-2 py-1 text-xs bg-[#252525] text-gray-300 border border-[#333] rounded hover:border-[#667eea] focus:outline-none focus:border-[#667eea]"
        disabled={isPlaying}
      >
        {Object.keys(NOTES).map((note) => (
          <option key={note} value={note}>
            {note}
          </option>
        ))}
      </select>

      {/* Play/Stop button */}
      <Button
        onClick={handlePlay}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5"
        title={isPlaying ? "Stop audio" : "Play audio"}
      >
        {isPlaying ? (
          <>
            <VolumeX size={14} />
            Stop
          </>
        ) : (
          <>
            <Volume2 size={14} />
            Play
          </>
        )}
      </Button>
    </div>
  );
};
