import { UserTier } from "@/config/tiers";

export interface UserPreferences {
  theme: "dark" | "light";
  language: "en" | "ru" | "uk";
}

export interface UserStats {
  projectsCount: number;
  lastLoginAt: Date | null;
}

export interface SubscriptionInfo {
  plan: "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  status: "active" | "cancelled" | "expired";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  preferences: UserPreferences;
  stats: UserStats;

  // Tier system
  tier: UserTier;
  subscription?: SubscriptionInfo;
}
