# UI Component Style Guide — 双心 Bridge | Два Сердца

This guide defines the visual language for all reusable UI components. Components adapt to each theme via CSS custom properties defined in the theme files.

---

## 1. Navigation

### Bottom Tab Bar
```
┌─────────────────────────────────────┐
│  ♥     🔍     💬     👤            │
│ Match  Search  Chat  Profile        │
└─────────────────────────────────────┘
```
- Height: 60px (mobile), 64px (desktop)
- Background: `var(--nav-bg)` with backdrop blur
- Active icon: `var(--nav-active)` color
- Inactive icon: `var(--nav-inactive)` opacity 0.4
- Badges: small red dot (10px diameter) at top-right of Chat icon

### Top Header
- Height: 44px (status bar) + 56px (app header)
- Shows app logo on left, notification bell or settings on right
- Title centered on sub-screens

---

## 2. Cards

### Match Card (Discovery)
```
┌──────────────────────────────┐
│           ○ Avatar           │
│         Name, Age           │
│         City · Zodiac       │
│  ━━━━━━━━━━━━━ 85% match   │
│  Tags: [🐯] [📖] [🎵]      │
│        ♥ Написать           │
└──────────────────────────────┘
```
- Border radius: `var(--radius-md)` (12px)
- Background: `var(--bg-card)` with `var(--match-card-border)` border
- Avatar: 56-72px, `var(--avatar-border)`
- Compatibility bar: `var(--compatibility-bar-bg)` with `var(--compatibility-bar-fill)` gradient
- Tags: pill-shaped, 22px height, colored by category

### Profile Card (Full)
- Larger card with avatar, stats row, bio, photo gallery, action buttons
- Stats row: age, match %, friends count in mini cards
- Photo gallery: 3-4 image thumbnails in a horizontal row

---

## 3. Buttons

### Primary Button
```
[      Продолжить →      ]
```
- Height: 48px
- Border radius: 24px (pill) or 12px
- Background: `var(--btn-primary-bg)` gradient
- Text: `var(--btn-primary-text)`, 15px, weight 600
- Shadow: `var(--shadow-button)`

### Secondary Button
```
[      Отмена       ]
```
- Height: 48px
- Border radius: 24px
- Background: `var(--btn-secondary-bg)` transparent
- Border: `var(--btn-secondary-border)`

### Icon Button
- Circle, 48-56px for main actions (like/heart, skip, super-like)
- Heart (primary action): 64px circle with gradient
- Skip: 56px circle with subtle border
- Super-like: 56px circle with accent color border

---

## 4. Form Elements

### Text Input
```
┌─────────────────────────┐
│ Label                   │
│ Value / Placeholder     │
└─────────────────────────┘
```
- Height: 48px
- Border radius: 14px
- Background: `var(--bg-input)`
- Border: `var(--border-color)`
- Focus: `var(--input-focus-ring)`
- Label: 11px, secondary text color
- Value: 14px, primary text color

### Select Dropdown
- Same styling as text input with dropdown arrow
- Options appear as bottom sheet on mobile

### Date Picker
- Custom picker with year, month, day wheels
- Zodiac sign auto-calculated from date

---

## 5. Voice Call Interface (Key Screen)

```
┌──────────────────────────────────┐
│          🎤 Voice Call           │
│                                  │
│       ● Avatar (large)           │
│       Name                       │
│       "Translating..."           │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🇷🇺: Привет! Как дела?   │    │
│  │ 🌐 → → →                │    │
│  │ 🇨🇳: 你好！你好吗？      │    │
│  └──────────────────────────┘    │
│                                  │
│   [🔇]  [🎤 (active)]  [⚙]    │
│                                  │
│   ━━━━━━━━━━━━━━━━━━━━━━━━      │
│   РАЗГОВОР: 03:24               │
└──────────────────────────────────┘
```
- Dark/light background depending on theme
- Translation overlay: dual bubbles (source language → target language)
- Microphone button: pulsing animation when recording
- Speaker/mute controls at bottom
- Timer showing call duration

---

## 6. Login / Registration Screens

### Welcome Screen
- App logo centered at top
- Tagline in both Chinese and Russian
- "Enter with phone number" primary CTA
- Social login options (WeChat, VK, Google)
- Terms & privacy policy links

### Registration Flow (Steps)
1. **Phone/Email** → verification code
2. **Name + Photo** → upload or camera
3. **Birth Date** → calendar picker → auto zodiac
4. **Gender + Looking for** → toggle chips
5. **Hobbies** → multi-select tags (Chinese & Russian themed)
6. **About me** → short bio text area

---

## 7. Matching / Compatibility Display

### Zodiac Compatibility
- Displayed as beautiful card with zodiac symbols
- Percentage score derived from Chinese zodiac + Western zodiac + birth elements
- Visual: circular chart or animated bar

### Compatibility Score
```
┌─────────────────────────────────────┐
│  ～ Совместимость ～                │
│                                     │
│        ╭─────╮                      │
│        │ 92% │                      │
│        ╰─────╯                      │
│   Бык 🐂  ×  Змея 🐍               │
│   Земля     Огонь    ★ Единство    │
└─────────────────────────────────────┘
```

---

## 8. Avatar & Badges

### User Avatar
- Circular, border from theme
- Online indicator: 10px green (`#2A9D8F`) dot at bottom-right
- Size variants: 40px (list), 56px (card), 80px (profile), 100px (call)

### Badges
| Badge | Description |
|-------|-------------|
| ✦ Premium | Gold star, diamond border |
| ✓ Verified | Blue checkmark |
| 🎤 Translator | Voice translator user |
| 🌏 Explorer | Learning a new culture |
| ❤️ Top Match | High compatibility |

---

## 9. Loading States & Empty States

### Loading Skeleton
- Animated shimmer effect using `--gradient-card-accent`
- Rounded rectangles matching component shapes

### Empty State
```
┌──────────────────────────────┐
│         ○ Icon (large)       │
│    "No matches yet"         │
│  "Complete your profile"    │
│  to get started"            │
│                              │
│  [ Complete Profile → ]     │
└──────────────────────────────┘
```

---

## 10. Animations & Micro-interactions

| Interaction | Animation |
|-------------|-----------|
| Card swipe left (skip) | Translate X -80% + fade |
| Card swipe right (like) | Translate X +80% + heart burst |
| Like button press | Scale 0.8 → 1.0 + color fill |
| Voice recording | Pulsing ring around mic icon |
| Match found! | Full screen celebration overlay |
| Tab switch | Fade cross 150ms |
| Page transition | Slide up 250ms ease-out |
| Notification dot | Bounce 2x then settle |

---

## 11. Design Tokens for Developers

All visual properties are exposed as CSS custom properties. Themes set values on `:root[data-theme="..."]`. Components use these variables:

```
/* Layout */
--nav-height: 60px;
--header-height: 100px;
--card-min-width: 160px;
--card-max-width: 340px;

/* Typography (set in design-system.md) */
--fs-* family
--fw-* family

/* Spacing (set in design-system.md) */
--space-* family

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;

/* Transitions */
--transition-fast: 150ms ease-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile S | 320px | Single column, compact |
| Mobile L | 375-414px | Single column, standard |
| Tablet | 768px | 2-column grid for discovery |
| Desktop | 1024px+ | Max-width container, sidebar nav |

Mobile-first approach: all components designed for 360px width first, then scale up.