"use client";

import React from "react";
import { TierFeatures } from "@/config/tiers";

interface UsageIndicatorProps {
  label: string;
  current: number;
  limit: number; // -1 means unlimited
  featureName?: keyof TierFeatures;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  label,
  current,
  limit,
}) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (current / limit) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[#0f0f0f] rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-400">{label}</span>
          <span
            className={`text-xs font-semibold ${
              isAtLimit
                ? "text-red-400"
                : isNearLimit
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            {isUnlimited ? (
              <>
                {current} <span className="text-gray-500">/ ♾️</span>
              </>
            ) : (
              <>
                {current} / {limit}
              </>
            )}
          </span>
        </div>

        {/* Progress bar (only for limited features) */}
        {!isUnlimited && (
          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isAtLimit
                  ? "bg-red-500"
                  : isNearLimit
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
