# 双心 Bridge | Два Сердца

**Мост между Китаем и Россией** — кросс-культурная платформа знакомств с голосовым переводом.

## 📱 Возможности

- **Голосовой перевод** 🇨🇳 ↔ 🇷🇺 в реальном времени через Web Speech API
- **Знакомства** по анкетам с совместимостью по гороскопу
- **Гороскоп**: китайский (12 животных) + западный (12 знаков) зодиак
- **6 тем дизайна**: 3 мужских (Тигр, Дракон, Феникс) + 3 женских (Сакура, Лотос, Жемчуг)
- **3 языка**: русский, китайский, английский — переключаются в один клик

## 📲 Скачать APK

**⬇️ [Скачать APK (v1.0.0)](https://github.com/paulafanasyev/bridges/releases/download/v1.0.0/dualhearts-bridge.apk)**

Или соберите сами:
```bash
git clone https://github.com/paulafanasyev/bridges.git
cd bridges/frontend
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## 💻 Быстрый старт (веб-версия)

```bash
# Терминал 1 — Бэкенд
cd backend
npm install
npm run build
PORT=3002 node dist/index.js

# Терминал 2 — Фронтенд
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## 🏗️ Структура проекта

```
📁 frontend/     — React/Vite SPA (9 страниц, i18n, 6 тем, PWA, Capacitor)
📁 backend/      — Node.js/Express API (JWT, совместимость, WebSocket, перевод)
📁 designs/      — UI/UX дизайн-система (логотип, 6 тем, мокапы)
📁 .github/      — GitHub Actions (автосборка APK)
```

## 🤝 Как помочь проекту

- ⭐ Поставьте звезду на GitHub
- 🐛 Сообщайте о багах в Issues
- 💬 Предлагайте идеи в Discussions
- 📢 Расскажите друзьям о приложении

## 📄 Лицензия

MIT
