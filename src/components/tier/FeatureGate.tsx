/**
 * 🚪 Feature Gate Component
 *
 * Универсальный компонент для блокировки фич по тарифу.
 *
 * Использование:
 *
 * <FeatureGate feature="canUseFilters">
 *   <DigitalFilterPanel />
 * FeatureGate>
 *
 * Или с fallback:
 *
 * <FeatureGate feature="canUseFilters" fallback={<LockedPanel />}>
 *   <DigitalFilterPanel />
 * </FeatureGate>
 */

import React from "react";
import { useTierCheck } from "@/hooks/useTierCheck";
import { TierFeatures } from "@/config/tiers";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: keyof TierFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockedOverlay?: boolean; // Показывать overlay вместо скрытия
  onLocked?: () => void; // Callback при блокировке
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showLockedOverlay = false,
  onLocked,
}) => {
  const { hasAccess, showUpgrade, requiredTier } = useTierCheck(feature);

  // Если доступ есть, просто рендерим children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Если нет доступа и задан fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Если нужен overlay
  if (showLockedOverlay) {
    return (
      <div className="relative">
        {/* Контент с blur */}
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <Lock size={32} className="mx-auto text-yellow-500 mb-2" />
            <p className="text-white font-semibold mb-1">
              {requiredTier === "free" ? "Sign In Required" : "Pro Feature"}
            </p>
            <p className="text-sm text-gray-400 mb-3">
              {requiredTier === "free"
                ? "Create a free account to unlock this"
                : "Upgrade to Pro to unlock this"}
            </p>
            <button
              onClick={() => {
                showUpgrade();
                onLocked?.();
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              {requiredTier === "free" ? "Sign In Free" : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // По умолчанию ничего не показываем
  return null;
};
