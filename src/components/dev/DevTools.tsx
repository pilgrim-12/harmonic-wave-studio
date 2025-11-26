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
      import("@/lib/dev/tierUtils").then((module) => {
        // Manually export to window to ensure it's available
        (window as any).setMyTier = module.setMyTier;
        (window as any).getMyTier = module.getMyTier;
        (window as any).giveProAccess = module.giveProAccess;
        (window as any).revertToFree = module.revertToFree;
        (window as any).showAvailableTiers = module.showAvailableTiers;
        (window as any).enableAllProFeatures = module.enableAllProFeatures;
        (window as any).disableAllProFeatures = module.disableAllProFeatures;
        (window as any).isAllProFeaturesEnabled = module.isAllProFeaturesEnabled;
        (window as any).showFeatureFlagStatus = module.showFeatureFlagStatus;

        console.log(
          "%c✅ Dev Tools Loaded",
          "color: #10b981; font-size: 12px; font-weight: bold"
        );
        console.log(
          "%cAvailable commands:",
          "color: #6b7280; font-size: 11px"
        );
        console.log("  await window.setMyTier('pro')");
        console.log("  await window.setMyTier('free')");
        console.log("  await window.getMyTier()");
        console.log("  window.showAvailableTiers()");
        console.log("");
        console.log(
          "%c🎛️ Feature Flag commands:",
          "color: #f59e0b; font-size: 11px; font-weight: bold"
        );
        console.log("  window.enableAllProFeatures()  // Give everyone Pro");
        console.log("  window.disableAllProFeatures() // Restore tier system");
        console.log("  window.showFeatureFlagStatus()");
      });
    }
  }, []);

  return null; // This component doesn't render anything
};
