export interface UserPreferences {
  theme: "dark" | "light";
  language: "en" | "ru" | "uk";
}

export interface UserStats {
  projectsCount: number;
  lastLoginAt: Date | null;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  preferences: UserPreferences;
  stats: UserStats;
}
