/**
 * Universal Hook for Tier-based Feature Access
 *
 * Usage:
 * const { hasAccess, showUpgrade } = useTierCheck("canUseFilters");
 * if (!hasAccess) showUpgrade();
 */

import { useAuth } from "@/contexts/AuthContext";
import {
  UserTier,
  TierFeatures,
  getTierFeatures,
  hasFeatureAccess,
  checkLimit,
  normalizeTier,
} from "@/config/tiers";
import { useCallback } from "react";

export interface TierCheckResult {
  currentTier: UserTier;
  hasAccess: boolean;
  requiredTier: UserTier | null;
  showUpgrade: () => void;
  checkLimit: (
    limitKey: "maxRadii" | "maxProjects" | "maxShares",
    currentCount: number
  ) => {
    allowed: boolean;
    remaining: number;
    isUnlimited: boolean;
  };
  features: TierFeatures;
}

export const useTierCheck = (
  featureName?: keyof TierFeatures
): TierCheckResult => {
  const { user, userProfile } = useAuth();

  const currentTier: UserTier = normalizeTier(userProfile?.tier, !!user);

  const features = getTierFeatures(currentTier);

  let hasAccess = true;
  let requiredTier: UserTier | null = null;

  if (featureName) {
    hasAccess = hasFeatureAccess(currentTier, featureName);

    if (!hasAccess) {
      requiredTier = "registered";
    }
  }

  const showUpgrade = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("show-upgrade-modal", {
        detail: {
          feature: featureName,
          currentTier,
          requiredTier,
        },
      })
    );
  }, [featureName, currentTier, requiredTier]);

  const checkLimitFn = useCallback(
    (
      limitKey: "maxRadii" | "maxProjects" | "maxShares",
      currentCount: number
    ) => {
      return checkLimit(currentTier, limitKey, currentCount);
    },
    [currentTier]
  );

  return {
    currentTier,
    hasAccess,
    requiredTier,
    showUpgrade,
    checkLimit: checkLimitFn,
    features,
  };
};
