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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isAllProEnabled, setIsAllProEnabled] = useState(false);

  // 🎛️ Feature Flag: Check if all Pro features are enabled (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAllProEnabled(localStorage.getItem("dev_enable_all_pro_features") === "true");
    }
  }, []);

  // Определяем текущий тарif
  let currentTier: UserTier = user
    ? (userProfile?.tier as UserTier) || "free"
    : "anonymous";

  // 🎛️ If feature flag is enabled, override to Pro
  if (isAllProEnabled) {
    currentTier = "pro";
  }

  const features = getTierFeatures(currentTier);

  // Проверка доступа к конкретной фиче
  let hasAccess = true;
  let requiredTier: UserTier | null = null;

  if (featureName) {
    hasAccess = hasFeatureAccess(currentTier, featureName);

    // Если нет доступа, определяем, какой тарif нужен
    if (!hasAccess) {
      if (currentTier === "anonymous") {
        // Проверяем, доступно ли на Free
        if (hasFeatureAccess("free", featureName)) {
          requiredTier = "free";
        } else {
          requiredTier = "pro";
        }
      } else if (currentTier === "free") {
        requiredTier = "pro";
      }
    }
  }

  const showUpgrade = useCallback(() => {
    setUpgradeModalOpen(true);
    // TODO: Открыть модалку upgrade через глобальный state или event
    console.log("🔒 Feature locked:", featureName, "Required:", requiredTier);

    // Можно использовать глобальный store или Context для модалки
    // Или emit custom event
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
