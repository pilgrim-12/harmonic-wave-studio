import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useRadiusStore } from "@/store/radiusStore";

export const useKeyboardShortcuts = () => {
  const { isPlaying, isPaused, play, pause, stop, reset } =
    useSimulationStore();
  const { selectedRadiusId, removeRadius } = useRadiusStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ": // Space
          event.preventDefault();
          if (!isPlaying) {
            play();
          } else {
            pause();
          }
          break;

        case "s":
          event.preventDefault();
          stop();
          break;

        case "r":
          event.preventDefault();
          reset();
          break;

        case "delete":
        case "backspace":
          event.preventDefault();
          if (selectedRadiusId) {
            removeRadius(selectedRadiusId);
          }
          break;

        case "escape":
          // Close any open modals/dropdowns
          // This will be handled by individual components
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isPlaying,
    isPaused,
    play,
    pause,
    stop,
    reset,
    selectedRadiusId,
    removeRadius,
  ]);
};
