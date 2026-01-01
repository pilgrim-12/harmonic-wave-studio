/**
 * 🎯 Universal Hook for Tier-based Feature Access
 *
 * Использование:
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
} from "@/config/tiers";
import { useState, useCallback, useEffect } from "react";

export interface TierCheckResult {
  // Текущий тарif пользователя
  currentTier: UserTier;

  // Проверка доступа к фиче
  hasAccess: boolean;

  // Какой тарif нужен для доступа
  requiredTier: UserTier | null;

  // Показать модалку upgrade
  showUpgrade: () => void;

  // Проверить лимит (для radii, projects, shares)
  checkLimit: (
    limitKey: "maxRadii" | "maxProjects" | "maxShares",
    currentCount: number
  ) => {
    allowed: boolean;
    remaining: number;
    isUnlimited: boolean;
  };

  // Получить все фичи текущего тарифа
  features: TierFeatures;
}

export const useTierCheck = (
  featureName?: keyof TierFeatures
): TierCheckResult => {
  const { user, userProfile } = useAuth();
  const [isAllProEnabled, setIsAllProEnabled] = useState(false);

  // 🎛️ Feature Flag: Check if all features are enabled (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAllProEnabled(localStorage.getItem("dev_enable_all_pro_features") === "true");
    }
  }, []);

  // Определяем текущий тариф
  // Важно: userProfile?.tier может быть "pro", "free" или undefined
  // Если tier не загружен еще, используем "free" как fallback для залогиненных
  let currentTier: UserTier = user
    ? (userProfile?.tier as UserTier) || "free"
    : "anonymous";

  // 🎛️ If feature flag is enabled, override to Pro (full access for testing)
  if (isAllProEnabled) {
    currentTier = "pro";
  }

  // Debug: log tier resolution
  if (featureName === "canUseFFT") {
    console.log("🎯 useTierCheck FFT:", {
      user: !!user,
      userProfileTier: userProfile?.tier,
      resolvedTier: currentTier,
    });
  }

  const features = getTierFeatures(currentTier);

  // Проверка доступа к конкретной фиче
  let hasAccess = true;
  let requiredTier: UserTier | null = null;

  if (featureName) {
    hasAccess = hasFeatureAccess(currentTier, featureName);

    // Если нет доступа, нужна регистрация (только free tier)
    if (!hasAccess) {
      requiredTier = "free"; // Только регистрация нужна, не оплата
    }
  }

  const showUpgrade = useCallback(() => {
    console.log("🔒 Feature locked:", featureName, "Required: Sign In");

    // Emit custom event to show sign-in modal
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
