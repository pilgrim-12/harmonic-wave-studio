# 🎯 Tier System - Usage Examples

## Как добавлять новые фичи к тарифным планам

### 1️⃣ Добавить новую фичу в конфиг (одно место!)

```typescript
// src/config/tiers.ts

export interface TierFeatures {
  // ... существующие фичи

  // ✨ НОВАЯ ФИЧА
  canUseAdvancedAnalytics: boolean;
}

// Добавляем в конфиги тарифов:
export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  anonymous: {
    features: {
      // ...
      canUseAdvancedAnalytics: false, // ❌
    },
  },
  free: {
    features: {
      // ...
      canUseAdvancedAnalytics: false, // ❌
    },
  },
  pro: {
    features: {
      // ...
      canUseAdvancedAnalytics: true, // ✅ Только Pro!
    },
    metadata: {
      benefits: [
        // ...
        "📊 Advanced Analytics", // Добавляем в список преимуществ
      ],
    },
  },
};
```

**Всё! Теперь можно использовать эту фичу везде.**

---

## 📚 Примеры использования

### ✅ Вариант 1: Блокировка целого компонента

```tsx
import { FeatureGate } from "@/components/tier/FeatureGate";

// Компонент будет виден только Pro пользователям
<FeatureGate feature="canUseFilters">
  <DigitalFilterPanel />
</FeatureGate>
```

### ✅ Вариант 2: С overlay (blur + кнопка Upgrade)

```tsx
<FeatureGate
  feature="canUseFFT"
  showLockedOverlay
>
  <FrequencyAnalysisPanel />
</FeatureGate>
```

### ✅ Вариант 3: Проверка в коде + custom UI

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function ExportPanel() {
  const { hasAccess, showUpgrade } = useTierCheck("canExportHighRes");

  const handleExport4K = () => {
    if (!hasAccess) {
      showUpgrade(); // Показывает модалку
      return;
    }
    // Экспортируем в 4K
    export4K();
  };

  return (
    <button onClick={handleExport4K}>
      Export 4K
      {!hasAccess && <Lock size={14} />}
    </button>
  );
}
```

### ✅ Вариант 4: Проверка лимитов (radii, projects, shares)

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function RadiusPanel() {
  const { checkLimit } = useTierCheck();
  const radii = useRadiusStore((s) => s.radii);

  const handleAddRadius = () => {
    const { allowed, remaining } = checkLimit("maxRadii", radii.length);

    if (!allowed) {
      alert(`Limit reached! Upgrade to add more radii.`);
      return;
    }

    // Добавляем радиус
    addRadius();

    // Показываем уведомление, если близко к лимиту
    if (remaining <= 1 && remaining > 0) {
      toast(`${remaining} radius left. Consider upgrading!`);
    }
  };

  return <button onClick={handleAddRadius}>Add Radius</button>;
}
```

### ✅ Вариант 5: Получить все фичи текущего тарифа

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function SettingsPanel() {
  const { features, currentTier } = useTierCheck();

  return (
    <div>
      <p>Your plan: {currentTier}</p>
      <p>Max Trail Length: {features.maxTrailLength}</p>
      <p>Max Sample Rate: {features.maxSampleRate}</p>

      {features.hasBadge && (
        <span className={`badge ${features.badgeColor}`}>
          {features.badgeText}
        </span>
      )}
    </div>
  );
}
```

### ✅ Вариант 6: Условный рендеринг кнопок

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function ControlPanel() {
  const filtersCheck = useTierCheck("canUseFilters");
  const fftCheck = useTierCheck("canUseFFT");

  return (
    <div>
      {/* Всегда показываем */}
      <PresetButton />
      <ExportButton />

      {/* Показываем только если есть доступ */}
      {filtersCheck.hasAccess && <FiltersButton />}
      {fftCheck.hasAccess && <FFTButton />}

      {/* Или показываем с Lock иконкой */}
      <button
        onClick={() => !filtersCheck.hasAccess && filtersCheck.showUpgrade()}
        disabled={!filtersCheck.hasAccess}
      >
        Filters {!filtersCheck.hasAccess && <Lock />}
      </button>
    </div>
  );
}
```

### ✅ Вариант 7: Защита роутов (middleware)

```tsx
// src/app/pro-features/page.tsx
"use client";

import { useEffect } from "react";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useRouter } from "next/navigation";

export default function ProFeaturesPage() {
  const { currentTier } = useTierCheck();
  const router = useRouter();

  useEffect(() => {
    if (currentTier !== "pro") {
      router.push("/pricing"); // Редирект на Pricing
    }
  }, [currentTier, router]);

  return <div>Pro-only content</div>;
}
```

---

## 🎨 UI Components для тарифов

### TierBadge (показывать рядом с именем)

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function UserProfile() {
  const { currentTier, features } = useTierCheck();

  return (
    <div>
      <span>John Doe</span>

      {features.hasBadge && (
        <span
          className={`px-2 py-0.5 text-xs font-bold rounded bg-gradient-to-r ${features.badgeColor} text-black`}
        >
          {features.badgeText}
        </span>
      )}
    </div>
  );
}
```

### LimitIndicator (показывать использование)

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function ProjectsLimit() {
  const { checkLimit } = useTierCheck();
  const projects = useProjectStore((s) => s.projects);

  const { remaining, isUnlimited } = checkLimit("maxProjects", projects.length);

  if (isUnlimited) {
    return <p className="text-green-400">Unlimited projects ✨</p>;
  }

  return (
    <div>
      <p>Projects: {projects.length} / {projects.length + remaining}</p>
      {remaining === 0 && (
        <p className="text-red-400">Limit reached! Upgrade to add more.</p>
      )}
      {remaining === 1 && (
        <p className="text-yellow-400">1 project slot left</p>
      )}
    </div>
  );
}
```

---

## 🔄 Как добавить новую фичу (полный workflow)

### Пример: Добавляем "Batch Processing" (только для Pro)

#### Шаг 1: Добавить в конфиг
```typescript
// src/config/tiers.ts
export interface TierFeatures {
  // ...
  canUseBatchProcessing: boolean; // ✨ НОВОЕ
}

// В pro тарифе:
pro: {
  features: {
    // ...
    canUseBatchProcessing: true, // ✅
  },
}
```

#### Шаг 2: Использовать в компоненте
```tsx
// src/components/workspace/BatchPanel.tsx
import { FeatureGate } from "@/components/tier/FeatureGate";

export const BatchPanel = () => {
  return (
    <FeatureGate feature="canUseBatchProcessing" showLockedOverlay>
      <div>
        <h3>Batch Processing</h3>
        <button>Process Multiple Files</button>
      </div>
    </FeatureGate>
  );
};
```

**ВСЁ!** Фича автоматически:
- ✅ Заблокирована для Free/Anonymous
- ✅ Показывает красивый overlay с кнопкой Upgrade
- ✅ Отображается в списке Pro benefits (если добавить в metadata.benefits)

---

## 📊 Отслеживание использования (Analytics)

```tsx
import { useTierCheck } from "@/hooks/useTierCheck";

function TrackFeatureUsage() {
  const { currentTier, hasAccess } = useTierCheck("canUseFilters");

  const handleUseFilter = () => {
    if (!hasAccess) {
      // Analytics: пользователь попытался использовать Pro фичу
      trackEvent("feature_blocked", {
        feature: "filters",
        tier: currentTier,
      });
      return;
    }

    // Analytics: успешное использование
    trackEvent("feature_used", {
      feature: "filters",
      tier: currentTier,
    });

    applyFilter();
  };
}
```

---

## 🎯 Преимущества этой архитектуры

### ✅ Централизация
- **Один файл** (`tiers.ts`) для всех лимитов
- Легко изменять значения
- Легко добавлять новые фичи

### ✅ Типобезопасность
- TypeScript проверяет все на этапе компиляции
- Автокомплит в IDE
- Нельзя ошибиться с названием фичи

### ✅ Переиспользуемость
- Универсальные компоненты (`FeatureGate`, `useTierCheck`)
- DRY - не повторяем логику проверок

### ✅ Масштабируемость
- Легко добавлять новые тарифы (например, "Enterprise")
- Легко добавлять новые типы лимитов
- Легко A/B тестировать разные лимиты

### ✅ UX
- Красивые overlay вместо "404 Access Denied"
- Понятные сообщения пользователю
- Плавная интеграция с UI

---

## 🚀 Roadmap

### Phase 1: Foundation (сейчас)
- [x] Конфиг тарифов
- [x] useTierCheck hook
- [x] FeatureGate component
- [ ] Обновить UserProfile с полем `tier`
- [ ] UpgradeModal component

### Phase 2: Integration
- [ ] Защитить все Pro фичи
- [ ] Добавить лимиты на radii/projects/shares
- [ ] Добавить TierBadge в профиль
- [ ] Usage indicators

### Phase 3: Payments
- [ ] Stripe интеграция
- [ ] Checkout flow
- [ ] Webhook для обновления tier
- [ ] Subscription management page
