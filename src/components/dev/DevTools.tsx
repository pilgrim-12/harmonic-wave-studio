"use client";

import { useEffect } from "react";

/**
 * Load development utilities
 * This component only loads in development mode.
 * In production, it renders nothing and executes no code.
 */
export const DevTools: React.FC = () => {
  useEffect(() => {
    // Only run in development - this check ensures no dev code runs in production
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Dynamically import dev utilities (only in development)
    import("@/lib/dev/tierUtils").then((module) => {
      const win = window as unknown as Record<string, unknown>;
      win.setMyTier = module.setMyTier;
      win.getMyTier = module.getMyTier;
      win.giveFullAccess = module.giveFullAccess;
      win.revertToAnonymous = module.revertToAnonymous;
      win.showAvailableTiers = module.showAvailableTiers;
      win.enableAllProFeatures = module.enableAllProFeatures;
      win.disableAllProFeatures = module.disableAllProFeatures;
      win.isAllProFeaturesEnabled = module.isAllProFeaturesEnabled;
      win.showFeatureFlagStatus = module.showFeatureFlagStatus;

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
  }, []);

  // In production, render nothing
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return null;
};
