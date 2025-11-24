# 🔧 Временное управление тарифами (до подключения Stripe)

## 📍 Где хранится информация о тарифе

Все данные о тарифе пользователя хранятся в **Firebase Firestore**:

```
Firestore → users → {userId} → tier: "free" | "pro"
```

### Структура документа пользователя:

```javascript
{
  displayName: "Yuri Chernov",
  email: "yurichernov12@gmail.com",
  photoURL: "...",
  tier: "free",  // ← ЗДЕСЬ!
  subscription: {  // ← Опционально для Pro
    plan: "monthly",
    startDate: Timestamp,
    endDate: Timestamp,
    status: "active"
  }
}
```

---

## 🚀 Способ 1: Изменить через Firebase Console (САМЫЙ ПРОСТОЙ)

### Шаг за шагом:

1. **Откройте Firebase Console**
   - https://console.firebase.google.com/project/harmonic-wave-studio/firestore

2. **Перейдите в Firestore Database → Data**

3. **Найдите коллекцию `users`**

4. **Найдите свой документ** (по email или userId)

5. **Кликните на документ → Edit**

6. **Измените поле `tier`:**
   - Было: `"free"`
   - Стало: `"pro"`

7. **Сохраните (Save)**

8. **Перезагрузите страницу приложения** (F5)

✅ **Готово!** Теперь у вас Pro доступ.

---

## 🛠️ Способ 2: Через код (для разработки)

Я создал специальную утилиту для быстрого переключения:

### Файл: `src/lib/dev/tierUtils.ts`

```typescript
// Использование в консоли браузера:
// await window.setMyTier("pro")
// await window.setMyTier("free")
```

### Как использовать:

1. Откройте приложение в браузере
2. Нажмите F12 (Dev Tools)
3. Перейдите в Console
4. Введите:

```javascript
// Дать себе Pro
await window.setMyTier("pro")

// Вернуть Free
await window.setMyTier("free")

// Проверить текущий тариф
await window.getMyTier()
```

---

## ⚡ Способ 3: Временный хак в AuthContext (для разработки)

### Открыть: `src/contexts/AuthContext.tsx`

Найдите строку 89:
```typescript
tier: "free" as const,
```

Измените на:
```typescript
tier: "pro" as const,  // 🔥 Временный хак
```

**Эффект:** Все новые пользователи будут получать Pro автоматически.

⚠️ **Внимание:** Не забудьте вернуть обратно перед деплоем!

---

## 🎯 Способ 4: URL параметр (для тестирования)

Добавлю специальный параметр для быстрого переключения во время разработки.

### Использование:
```
http://localhost:3000/?dev_tier=pro
http://localhost:3000/?dev_tier=free
```

---

## 📊 Как проверить, что Pro работает

### 1. Проверка в UI:
- ✅ Можете добавить больше 5 радиусов
- ✅ Digital Filters разблокированы (нет blur overlay)
- ✅ FFT Analysis разблокирован (нет blur overlay)

### 2. Проверка в консоли:
```javascript
// Открыть Dev Tools (F12) → Console
const profile = await firebase.firestore()
  .collection('users')
  .doc('YOUR_USER_ID')
  .get()

console.log('Current tier:', profile.data().tier)
```

### 3. Проверка через React DevTools:
- Установите React DevTools
- Найдите `AuthContext`
- Посмотрите `userProfile.tier`

---

## 🔄 Как вернуться на Free

### Вариант А: Firebase Console
1. Откройте документ пользователя
2. Измените `tier: "pro"` → `tier: "free"`
3. Перезагрузите страницу

### Вариант Б: Console
```javascript
await window.setMyTier("free")
```

---

## 💡 Рекомендации для разработки

### Создайте тестовых пользователей:

1. **Создайте 3 Google аккаунта** (или используйте временные email)
   - test-anonymous@example.com (не логиниться)
   - test-free@example.com (tier: "free")
   - test-pro@example.com (tier: "pro")

2. **Настройте тарифы** через Firebase Console

3. **Переключайтесь между ними** для тестирования

---

## 🎨 Что будет после подключения Stripe

### Автоматизация:

1. **Пользователь кликает "Upgrade to Pro"**
   - Редирект на Stripe Checkout
   - Оплата $4.99/месяц

2. **Stripe Webhook получает `payment.succeeded`**
   ```javascript
   // Автоматически обновляем Firestore:
   await db.collection('users').doc(userId).update({
     tier: 'pro',
     subscription: {
       plan: 'monthly',
       startDate: now,
       endDate: nextMonth,
       status: 'active',
       stripeCustomerId: '...',
       stripeSubscriptionId: '...'
     }
   })
   ```

3. **Stripe Webhook получает `subscription.deleted`** (отмена)
   ```javascript
   // Автоматически понижаем до Free:
   await db.collection('users').doc(userId).update({
     tier: 'free',
     'subscription.status': 'cancelled'
   })
   ```

### Проверка истечения подписки:

Можно добавить Cloud Function, которая ежедневно проверяет:
```javascript
// Firebase Cloud Function (scheduled)
exports.checkExpiredSubscriptions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const expired = await db.collection('users')
      .where('subscription.endDate', '<', now)
      .where('subscription.status', '==', 'active')
      .get();

    // Понизить до Free
    for (const doc of expired.docs) {
      await doc.ref.update({
        tier: 'free',
        'subscription.status': 'expired'
      });
    }
  });
```

---

## 🔐 Безопасность

### Firestore Rules для поля `tier`:

```javascript
// firestore.rules
match /users/{userId} {
  allow read: if request.auth.uid == userId;

  allow write: if request.auth.uid == userId &&
    // Нельзя изменить tier вручную
    (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['tier', 'subscription']));
}
```

Это запретит пользователям самим менять свой тариф через клиент.

Изменение `tier` возможно только через:
- Firebase Admin SDK (серверная сторона)
- Stripe Webhooks
- Firebase Console (администратор)

---

## 📝 Checklist перед запуском Stripe

- [ ] Stripe account зарегистрирован
- [ ] Product и Price созданы в Stripe Dashboard
- [ ] Webhook endpoint настроен (`/api/webhooks/stripe`)
- [ ] Webhook подписан на события: `checkout.session.completed`, `customer.subscription.deleted`
- [ ] Firestore Rules обновлены (запретить изменение tier)
- [ ] Cloud Function для проверки истечения подписок (опционально)
- [ ] Тестирование на Stripe Test Mode

---

## 🆘 Troubleshooting

### Проблема: Tier не обновляется после изменения в Firestore

**Решение:**
1. Проверьте, что onSnapshot подписка активна (см. консоль)
2. Перезагрузите страницу (F5)
3. Очистите кеш браузера

### Проблема: После логина tier остается "anonymous"

**Решение:**
1. Откройте Firebase Console → Firestore
2. Проверьте, что документ пользователя существует
3. Проверьте, что поле `tier` присутствует
4. Если нет - добавьте вручную

### Проблема: Pro фичи не разблокируются

**Решение:**
1. Проверьте в Dev Tools → React Components → AuthContext → userProfile.tier
2. Должно быть `"pro"`, а не `"free"`
3. Проверьте консоль на ошибки

---

## 🎉 Быстрый старт для тестирования

```bash
# 1. Запустить приложение
npm run dev

# 2. Открыть в браузере
http://localhost:3000

# 3. Залогиниться

# 4. Открыть Firebase Console
https://console.firebase.google.com/project/harmonic-wave-studio/firestore

# 5. Найти свой документ в users → изменить tier на "pro"

# 6. Перезагрузить страницу → все Pro фичи доступны!
```

---

## 💡 Полезные команды для Console

```javascript
// Получить текущий tier
const { userProfile } = useAuth();
console.log('Current tier:', userProfile?.tier);

// Получить все фичи текущего тарифа
import { getTierFeatures } from '@/config/tiers';
const features = getTierFeatures(userProfile?.tier || 'anonymous');
console.table(features);

// Проверить доступ к конкретной фиче
import { hasFeatureAccess } from '@/config/tiers';
console.log('Can use filters:', hasFeatureAccess('pro', 'canUseFilters'));
```

---

Этот файл поможет вам легко управлять тарифами во время разработки! 🚀
