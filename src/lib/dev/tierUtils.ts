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
 * Дать себе Pro (быстрый шорткат)
 */
export async function giveProAccess(): Promise<void> {
  await setMyTier("pro");
}

/**
 * Вернуть себе Free
 */
export async function revertToFree(): Promise<void> {
  await setMyTier("free");
}

/**
 * Показать все доступные тарифы
 */
export function showAvailableTiers(): void {
  const tiers: UserTier[] = ["anonymous", "free", "pro"];

  console.log("📋 Available tiers:");
  console.table(
    tiers.map((tier) => ({
      Tier: tier,
      Command: `await window.setMyTier("${tier}")`,
    }))
  );
}

// ============================================
// Экспортируем в window для использования в консоли
// ============================================

if (typeof window !== "undefined") {
  (window as any).setMyTier = setMyTier;
  (window as any).getMyTier = getMyTier;
  (window as any).giveProAccess = giveProAccess;
  (window as any).revertToFree = revertToFree;
  (window as any).showAvailableTiers = showAvailableTiers;

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
}
