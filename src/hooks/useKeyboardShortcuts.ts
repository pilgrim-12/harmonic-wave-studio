import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useRadiusStore } from "@/store/radiusStore";

export const useKeyboardShortcuts = () => {
  const { isPlaying, isPaused, play, pause, stop, reset } =
    useSimulationStore();
  const { selectedRadiusId, removeRadius, undo, redo, canUndo, canRedo } =
    useRadiusStore();

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

      // ⭐ Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // ⭐ Redo: Ctrl+Shift+Z or Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "z") ||
        ((event.ctrlKey || event.metaKey) && event.key === "y")
      ) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
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
    undo,
    redo,
    canUndo,
    canRedo,
  ]);
};
