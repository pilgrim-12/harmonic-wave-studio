"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Play, Sliders, Activity, Box, Share2, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Harmonic Wave Studio!",
    description: "Create stunning visualizations of Fourier series with interactive epicycles. Let's take a quick tour of the main features.",
    icon: <Sparkles size={24} className="text-[#667eea]" />,
    position: "center",
  },
  {
    id: "radii",
    title: "Add Radii (Harmonics)",
    description: "Each radius represents a harmonic component. Click 'Add Radius' to create epicycles with custom frequency, amplitude, and phase. The more radii, the more complex your waveform!",
    icon: <Sliders size={24} className="text-[#667eea]" />,
    position: "top-left",
    highlight: "[data-tour='radii-panel']",
  },
  {
    id: "controls",
    title: "Playback Controls",
    description: "Use Play/Pause to animate the epicycles. Adjust speed, reset the simulation, or step through time manually. Press SPACE to play/pause quickly!",
    icon: <Play size={24} className="text-[#667eea]" />,
    position: "top-right",
    highlight: "[data-tour='control-panel']",
  },
  {
    id: "visualization",
    title: "Interactive Canvas",
    description: "Watch the epicycles rotate and trace beautiful patterns. The signal graph below shows the waveform being generated in real-time. Click on fullscreen for a better view!",
    icon: <Activity size={24} className="text-[#667eea]" />,
    position: "center",
    highlight: "[data-tour='canvas']",
  },
  {
    id: "3d",
    title: "3D Visualization",
    description: "Click the '3D' button to see your epicycles in three dimensions! Rotate, zoom, and explore your creation from any angle.",
    icon: <Box size={24} className="text-[#667eea]" />,
    position: "top-right",
    highlight: "[data-tour='3d-button']",
  },
  {
    id: "share",
    title: "Save & Share",
    description: "Sign in to save your projects and share them to the community gallery. Others can view, like, and get inspired by your creations!",
    icon: <Share2 size={24} className="text-[#667eea]" />,
    position: "top-right",
    highlight: "[data-tour='save-button']",
  },
  {
    id: "pro",
    title: "Unlock Pro Features",
    description: "Upgrade to Pro for advanced tools: FFT analysis, digital filters, audio generation, GIF export, and unlimited everything. Start free and upgrade when you're ready!",
    icon: <Crown size={24} className="text-[#feca57]" />,
    position: "center",
  },
];

const STORAGE_KEY = "harmonic-wave-studio-onboarding-completed";

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  forceShow = false,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Delay showing to let the page render first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Handle element highlighting
  useEffect(() => {
    if (!isVisible) return;

    const step = TOUR_STEPS[currentStep];
    if (step.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setHighlightedElement(null);
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isVisible]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    setHighlightedElement(null);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleNext, handlePrevious, handleSkip]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Calculate modal position based on step
  const getModalPosition = () => {
    switch (step.position) {
      case "top-left":
        return "top-24 left-80";
      case "top-right":
        return "top-24 right-8";
      case "bottom-left":
        return "bottom-24 left-80";
      case "bottom-right":
        return "bottom-24 right-8";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />

      {/* Highlight overlay for current element */}
      {highlightedElement && (
        <div
          className="fixed z-[101] ring-4 ring-[#667eea] ring-offset-4 ring-offset-transparent rounded-xl pointer-events-none animate-pulse"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
          }}
        />
      )}

      {/* Tour Modal */}
      <div
        className={`fixed z-[102] ${getModalPosition()} w-[420px] max-w-[90vw]`}
      >
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-gradient-to-r from-[#667eea]/10 to-transparent">
            <div className="flex items-center gap-3">
              {step.icon}
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              title="Skip tour"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress */}
          <div className="px-6 pb-2">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? "bg-[#667eea]" : "bg-[#2a2a2a]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-[#2a2a2a]">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="bg-[#667eea] hover:bg-[#5a6fd6]"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Sparkles size={16} />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-400">Enter</kbd> to continue
            or <kbd className="px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-400">Esc</kbd> to skip
          </span>
        </div>
      </div>
    </>
  );
};

// Hook to reset onboarding (for testing or user request)
export const useResetOnboarding = () => {
  return useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);
};

// Export storage key for external use
export const ONBOARDING_STORAGE_KEY = STORAGE_KEY;
