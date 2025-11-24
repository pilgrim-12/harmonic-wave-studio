"use client";

import { useEffect } from "react";

/**
 * Load development utilities
 * This component loads tier management utilities in development mode
 */
export const DevTools: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Dynamically import dev utilities
      import("@/lib/dev/tierUtils").then(() => {
        console.log(
          "%c✅ Dev Tools Loaded",
          "color: #10b981; font-size: 12px; font-weight: bold"
        );
        console.log(
          "%cType 'window.showAvailableTiers()' to see available commands",
          "color: #6b7280; font-size: 11px"
        );
      });
    }
  }, []);

  return null; // This component doesn't render anything
};
