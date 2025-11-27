/**
 * 🔧 Development Utilities for Tier Management
 *
 * Эти функции доступны в консоли браузера для быстрого переключения тарифа
 * во время разработки (до подключения Stripe).
 *
 * Usage:
 * 1. Откройте Dev Tools (F12)
 * 2. Перейдите в Console
 * 3. Введите: await window.setMyTier("pro")
 */

import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firebase";
import { UserTier } from "@/config/tiers";

/**
 * Установить свой тариф (для разработки)
 */
export async function setMyTier(tier: UserTier): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ Error: You must be logged in");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      tier,
      updatedAt: new Date(),
    });

    console.log(`✅ Tier updated to: ${tier}`);
    console.log("🔄 Please reload the page to see changes");

    // Предложить перезагрузить
    if (
      confirm(
        `Tier updated to ${tier}!\n\nReload the page to see changes?`
      )
    ) {
      window.location.reload();
    }
  } catch (error) {
    console.error("❌ Error updating tier:", error);
  }
}

/**
 * Получить текущий тариф
 */
export async function getMyTier(): Promise<UserTier | null> {
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ Error: You must be logged in");
    return null;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.error("❌ Error: User profile not found");
      return null;
    }

    const tier = snapshot.data().tier as UserTier;
    console.log(`📊 Current tier: ${tier}`);
    return tier;
  } catch (error) {
    console.error("❌ Error getting tier:", error);
    return null;
  }
}

/**
 * Дать себе полный доступ (быстрый шорткат)
 */
export async function giveFullAccess(): Promise<void> {
  await setMyTier("free");
}

/**
 * Вернуть себе анонимный доступ
 */
export async function revertToAnonymous(): Promise<void> {
  await setMyTier("anonymous");
}

/**
 * Показать все доступные тарифы
 */
export function showAvailableTiers(): void {
  const tiers: UserTier[] = ["anonymous", "free"];

  console.log("📋 Available tiers:");
  console.table(
    tiers.map((tier) => ({
      Tier: tier,
      Command: `await window.setMyTier("${tier}")`,
    }))
  );
}

// ============================================
// 🎛️ FEATURE FLAG: Enable All Pro Features
// ============================================

const FEATURE_FLAG_KEY = "dev_enable_all_pro_features";

/**
 * Включить все Pro фичи для всех пользователей (для разработки/тестирования)
 */
export function enableAllProFeatures(): void {
  localStorage.setItem(FEATURE_FLAG_KEY, "true");
  console.log("✅ All Pro features enabled for everyone!");
  console.log("🔄 Please reload the page to see changes");

  if (confirm("All Pro features enabled!\n\nReload the page?")) {
    window.location.reload();
  }
}

/**
 * Отключить feature flag (вернуть нормальную работу tier system)
 */
export function disableAllProFeatures(): void {
  localStorage.removeItem(FEATURE_FLAG_KEY);
  console.log("✅ Feature flag disabled. Tier system restored.");
  console.log("🔄 Please reload the page to see changes");

  if (confirm("Tier system restored!\n\nReload the page?")) {
    window.location.reload();
  }
}

/**
 * Проверить статус feature flag
 */
export function isAllProFeaturesEnabled(): boolean {
  return localStorage.getItem(FEATURE_FLAG_KEY) === "true";
}

/**
 * Показать статус feature flag
 */
export function showFeatureFlagStatus(): void {
  const enabled = isAllProFeaturesEnabled();
  console.log(
    `🎛️ All Pro Features: ${enabled ? "✅ ENABLED" : "❌ DISABLED"}`
  );
  if (enabled) {
    console.log("   → Everyone has Pro access");
    console.log("   → To disable: window.disableAllProFeatures()");
  } else {
    console.log("   → Normal tier system active");
    console.log("   → To enable: window.enableAllProFeatures()");
  }
}

// ============================================
// Экспортируем в window для использования в консоли
// ============================================

if (typeof window !== "undefined") {
  (window as any).setMyTier = setMyTier;
  (window as any).getMyTier = getMyTier;
  (window as any).giveFullAccess = giveFullAccess;
  (window as any).revertToAnonymous = revertToAnonymous;
  (window as any).showAvailableTiers = showAvailableTiers;
  (window as any).enableAllProFeatures = enableAllProFeatures;
  (window as any).disableAllProFeatures = disableAllProFeatures;
  (window as any).isAllProFeaturesEnabled = isAllProFeaturesEnabled;
  (window as any).showFeatureFlagStatus = showFeatureFlagStatus;

  // Helpful message in console
  console.log(
    "%c🔧 Tier Dev Utils Loaded",
    "color: #667eea; font-size: 14px; font-weight: bold"
  );
  console.log(
    "%cAvailable commands:",
    "color: #888; font-size: 12px"
  );
  console.log("  await window.setMyTier('pro')");
  console.log("  await window.setMyTier('free')");
  console.log("  await window.getMyTier()");
  console.log("  await window.giveProAccess()");
  console.log("  await window.revertToFree()");
  console.log("  window.showAvailableTiers()");
  console.log("");
  console.log(
    "%c🎛️ Feature Flag commands:",
    "color: #f59e0b; font-size: 12px; font-weight: bold"
  );
  console.log("  window.enableAllProFeatures()  // Give everyone Pro");
  console.log("  window.disableAllProFeatures() // Restore tier system");
  console.log("  window.showFeatureFlagStatus()");
}
