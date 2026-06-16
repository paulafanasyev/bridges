# 双心 Bridge | Два Сердца

**Мост между Китаем и Россией** — кросс-культурная платформа знакомств с голосовым переводом.

## 📱 Возможности

- **Голосовой перевод** 🇨🇳 ↔ 🇷🇺 в реальном времени
- **Знакомства** по анкетам с совместимостью
- **Гороскоп**: китайский + западный зодиак
- **6 тем дизайна**: 3 мужских (Тигр, Дракон, Феникс) + 3 женских (Сакура, Лотос, Жемчуг)
- **3 языка**: русский, китайский, английский

## 📲 Установка APK

Скачайте последнюю версию APK из [Releases](https://github.com/dualhearts/bridge/releases) или со страницы Actions.

### Сборка вручную

```bash
cd frontend
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

APK будет в `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS

```bash
cd frontend
npm install
npm run build
npx cap sync ios
# Открыть в Xcode: npx cap open ios
```

## 🔧 Структура проекта

```
📁 frontend/     — React/Vite SPA (Capacitor mobile)
📁 backend/      — Node.js/Express API + WebSocket
📁 designs/      — UI/UX дизайн-система и темы
```

## 🔗 API

Бэкенд на порту 3001. Полная документация: `/api/health`