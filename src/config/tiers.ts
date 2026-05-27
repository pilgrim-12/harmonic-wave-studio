/**
 * Centralized Tier Configuration
 *
 * Two tiers: anonymous (not signed in) and registered (signed in, full access).
 */

export type UserTier = "anonymous" | "registered";

export interface TierFeatures {
  // === Radii & Projects ===
  maxRadii: number; // -1 = unlimited
  maxProjects: number; // -1 = unlimited
  maxShares: number; // -1 = unlimited

  // === Canvas & Visualization ===
  maxTrailLength: number;
  maxSampleRate: number;
  hasWatermark: boolean;

  // === Features ===
  canUsePresets: boolean;
  canExport: boolean;
  canUseAudio: boolean;
  canUseFilters: boolean;
  canUseFFT: boolean;
  canUseNoise: boolean;

  // === Export Options ===
  canExportJSON: boolean;
  canExportCSV: boolean;
  canExportPNG: boolean;
  canExportHighRes: boolean; // 4K PNG
  canBatchExport: boolean;
  canExportGIF: boolean;

  // === Social ===
  canShareToGallery: boolean;
  canCommentOnProjects: boolean;
  canLikeProjects: boolean;

  // === UI/UX ===
  showAds: boolean;
}

export interface TierMetadata {
  name: string;
  displayName: string;
  description: string;
  color: string;
}

export interface TierConfig {
  features: TierFeatures;
  metadata: TierMetadata;
}

// ============================================
// TIER CONFIGURATIONS
// ============================================

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  // ==========================================
  // Anonymous (not signed in)
  // ==========================================
  anonymous: {
    features: {
      // Limits
      maxRadii: 3,
      maxProjects: 0,
      maxShares: 0,
      maxTrailLength: 500,
      maxSampleRate: 500,
      hasWatermark: true,

      // Features
      canUsePresets: true,
      canExport: false,
      canUseAudio: false,
      canUseFilters: false,
      canUseFFT: false,
      canUseNoise: false,

      // Export
      canExportJSON: false,
      canExportCSV: false,
      canExportPNG: false,
      canExportHighRes: false,
      canBatchExport: false,
      canExportGIF: false,

      // Social
      canShareToGallery: false,
      canCommentOnProjects: false,
      canLikeProjects: true,

      // UI/UX
      showAds: true,
    },
    metadata: {
      name: "anonymous",
      displayName: "Guest",
      description: "Try the basics without signing in",
      color: "#6b7280", // gray
    },
  },

  // ==========================================
  // Registered (signed in, full access)
  // ==========================================
  registered: {
    features: {
      // Limits - all unlimited
      maxRadii: -1,
      maxProjects: -1,
      maxShares: -1,
      maxTrailLength: 4000,
      maxSampleRate: 2000,
      hasWatermark: false,

      // Features - all enabled
      canUsePresets: true,
      canExport: true,
      canUseAudio: true,
      canUseFilters: true,
      canUseFFT: true,
      canUseNoise: true,

      // Export - all formats
      canExportJSON: true,
      canExportCSV: true,
      canExportPNG: true,
      canExportHighRes: true,
      canBatchExport: true,
      canExportGIF: true,

      // Social - all enabled
      canShareToGallery: true,
      canCommentOnProjects: true,
      canLikeProjects: true,

      // UI/UX
      showAds: false,
    },
    metadata: {
      name: "registered",
      displayName: "Registered",
      description: "Full access to all features",
      color: "#3b82f6", // blue
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize legacy tier values from Firestore.
 * Old users may have "free" or "pro" — map them to "registered".
 */
export const normalizeTier = (tier: string | undefined, isAuthenticated: boolean): UserTier => {
  if (!isAuthenticated) return "anonymous";
  if (tier === "anonymous") return "anonymous";
  if (tier === "registered") return "registered";
  // Legacy values: "free", "pro", or anything else → registered
  return "registered";
};

export const getTierConfig = (tier: UserTier): TierConfig => {
  return TIER_CONFIG[tier];
};

export const getTierFeatures = (tier: UserTier): TierFeatures => {
  return TIER_CONFIG[tier].features;
};

export const getTierMetadata = (tier: UserTier): TierMetadata => {
  return TIER_CONFIG[tier].metadata;
};

export const hasFeatureAccess = (
  tier: UserTier,
  feature: keyof TierFeatures
): boolean => {
  const value = TIER_CONFIG[tier].features[feature];

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return false;
};

export const checkLimit = (
  tier: UserTier,
  limitKey: "maxRadii" | "maxProjects" | "maxShares",
  currentCount: number
): { allowed: boolean; remaining: number; isUnlimited: boolean } => {
  const limit = TIER_CONFIG[tier].features[limitKey];

  if (limit === -1) {
    return { allowed: true, remaining: -1, isUnlimited: true };
  }

  const remaining = Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    remaining,
    isUnlimited: false,
  };
};

export const getAllTiers = (): TierConfig[] => {
  return [TIER_CONFIG.anonymous, TIER_CONFIG.registered];
};
