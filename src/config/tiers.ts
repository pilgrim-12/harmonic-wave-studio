/**
 * 🎯 Centralized Tier Configuration
 *
 * Это единственное место, где определяются лимиты и возможности для каждого тарифа.
 * Чтобы добавить новую фичу:
 * 1. Добавьте поле в TierFeatures
 * 2. Определите значения для каждого тарифа в TIER_CONFIG
 * 3. Используйте useTierCheck("featureName") в компонентах
 */

export type UserTier = "anonymous" | "free";

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

  // === Social ===
  canShareToGallery: boolean;
  canCommentOnProjects: boolean;
  canLikeProjects: boolean;

  // === UI/UX ===
  showAds: boolean;
  prioritySupport: boolean;
  hasBadge: boolean;
  badgeColor?: string;
  badgeText?: string;

  // === Future Features (легко добавлять) ===
  canUseCollaboration?: boolean;
  canUseAPI?: boolean;
  canUseTemplates?: boolean;
}

export interface TierMetadata {
  name: string;
  displayName: string;
  price: number; // USD per month
  yearlyPrice?: number; // USD per year
  description: string;
  color: string; // для UI
  popular?: boolean; // показывать "Most Popular" badge
  benefits: string[]; // список преимуществ для Pricing page
}

export interface TierConfig {
  features: TierFeatures;
  metadata: TierMetadata;
}

// ============================================
// 🎨 TIER CONFIGURATIONS
// ============================================

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  // ==========================================
  // 👤 ANONYMOUS (Незалогиненные)
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
      canUsePresets: false,
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

      // Social
      canShareToGallery: false,
      canCommentOnProjects: false,
      canLikeProjects: true, // можно лайкать

      // UI/UX
      showAds: true,
      prioritySupport: false,
      hasBadge: false,
    },
    metadata: {
      name: "anonymous",
      displayName: "Guest",
      price: 0,
      description: "Try the basics without signing in",
      color: "#6b7280", // gray
      benefits: [
        "3 radii limit",
        "Basic visualization",
        "View gallery",
      ],
    },
  },

  // ==========================================
  // 🆓 FREE (Зарегистрированные пользователи - полный доступ)
  // ==========================================
  free: {
    features: {
      // Limits - все unlimited для зарегистрированных
      maxRadii: -1, // unlimited
      maxProjects: -1, // unlimited
      maxShares: -1, // unlimited
      maxTrailLength: 2000,
      maxSampleRate: 2000,
      hasWatermark: false,

      // Features - все доступны
      canUsePresets: true,
      canExport: true,
      canUseAudio: true,
      canUseFilters: true, // ✅ Теперь доступно
      canUseFFT: true, // ✅ Теперь доступно
      canUseNoise: true,

      // Export - все форматы доступны
      canExportJSON: true,
      canExportCSV: true,
      canExportPNG: true,
      canExportHighRes: true, // ✅ Теперь доступно
      canBatchExport: true, // ✅ Теперь доступно

      // Social - все доступно
      canShareToGallery: true,
      canCommentOnProjects: true,
      canLikeProjects: true,

      // UI/UX
      showAds: false,
      prioritySupport: false,
      hasBadge: false,
    },
    metadata: {
      name: "free",
      displayName: "Registered",
      price: 0,
      description: "Full access for registered users",
      color: "#3b82f6", // blue
      benefits: [
        "✨ Unlimited radii",
        "✨ Unlimited projects",
        "✨ Unlimited gallery shares",
        "🎛️ Digital Filters (Butterworth, Chebyshev)",
        "📊 Real-time FFT Analysis",
        "🎨 Trail length up to 2000 points",
        "⚡ Sample rate up to 2000 Hz",
        "🖼️ 4K PNG export",
        "📦 Batch export",
        "All presets",
        "Audio generation",
        "100% Free - No payment required",
      ],
    },
  },
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Получить конфигурацию для тарифа
 */
export const getTierConfig = (tier: UserTier): TierConfig => {
  return TIER_CONFIG[tier];
};

/**
 * Получить фичи для тарифа
 */
export const getTierFeatures = (tier: UserTier): TierFeatures => {
  return TIER_CONFIG[tier].features;
};

/**
 * Получить метаданные для тарифа
 */
export const getTierMetadata = (tier: UserTier): TierMetadata => {
  return TIER_CONFIG[tier].metadata;
};

/**
 * Проверить, есть ли доступ к фиче
 */
export const hasFeatureAccess = (
  tier: UserTier,
  feature: keyof TierFeatures
): boolean => {
  const value = TIER_CONFIG[tier].features[feature];

  // Для boolean полей
  if (typeof value === "boolean") {
    return value;
  }

  // Для числовых лимитов (если > 0 или -1, то доступно)
  if (typeof value === "number") {
    return value !== 0;
  }

  return false;
};

/**
 * Проверить лимит (сколько осталось)
 */
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

/**
 * Получить список всех тарифов
 */
export const getAllTiers = (): TierConfig[] => {
  return [TIER_CONFIG.anonymous, TIER_CONFIG.free];
};
