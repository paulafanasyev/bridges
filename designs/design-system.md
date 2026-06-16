# 双心 Bridge | Два Сердца — Design System

## Brand Identity

**Name:** 双心 Bridge | Два Сердца  
**Tagline:** Мост между сердцами / 心与心之间的桥梁  
**Core Concept:** A bridge connecting two hearts across Chinese and Russian cultures.

The brand uses a **double-heart** logo where Chinese red and Russian blue merge through a golden bridge, symbolizing unity, warmth, and cultural exchange.

---

## Color System

### Primary Brand Colors

| Role | Hex | Usage |
|------|-----|-------|
| ❤️ Brand Red | `#E63946` | Primary CTAs, love icons, Chinese cultural elements |
| 💙 Brand Blue | `#457B9D` | Secondary CTAs, Russian cultural elements, trust |
| 💛 Accent Gold | `#FFB703` | Premium features, highlights, stars, special badges |
| 🌑 Dark Background | `#1D3557` | Deep backgrounds (dark mode base) |
| ⚪ Light Background | `#F1FAEE` | Light mode background |
| 🌊 Light Blue | `#A8DADC` | Soft accents, backgrounds, Russian decorative elements |

### Extended Palette

| Name | Hex | Use Case |
|------|-----|----------|
| Crimson | `#C1121F` | Deep red for emphasis |
| Dark Navy | `#0B1A33` | Footer, deep dark mode |
| Soft Pink | `#FFCDB2` | Female themes, hearts |
| Warm Sand | `#E8D5B7` | Chinese paper-texture backgrounds |
| Ice Blue | `#D6E8F0` | Russian winter-themed backgrounds |
| Forest Green | `#2A9D8F` | Success, online status, verified |
| Deep Teal | `#264653` | Dark mode cards |
| Warm Gray | `#6C757D` | Subtle text, icons |
| Near White | `#F8F9FA` | Card backgrounds |
| Off Black | `#212529` | Primary text |

---

## Typography Guide

### Font Stack

#### Primary UI (English + Russian + General)
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

#### Chinese Text
```
font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
```

#### Decorative / Headlines (Optional)
```
font-family: 'Playfair Display', 'Noto Serif SC', Georgia, 'Times New Roman', serif;
```

### Font Sizes (Mobile-First)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--fs-xs` | 0.75rem (12px) | 1.4 | Captions, metadata |
| `--fs-sm` | 0.875rem (14px) | 1.5 | Body small, secondary text |
| `--fs-base` | 1rem (16px) | 1.6 | Body text, list items |
| `--fs-lg` | 1.125rem (18px) | 1.5 | Card titles, subtitles |
| `--fs-xl` | 1.25rem (20px) | 1.4 | Section headers |
| `--fs-2xl` | 1.5rem (24px) | 1.3 | Screen titles |
| `--fs-3xl` | 2rem (32px) | 1.2 | Hero headlines |
| `--fs-4xl` | 2.5rem (40px) | 1.1 | Large hero |

### Font Weights

- `--fw-regular`: 400 (body text)
- `--fw-medium`: 500 (buttons, labels)
- `--fw-semibold`: 600 (subheadings)
- `--fw-bold`: 700 (headings)

### Typography Notes

1. **Cyrillic Compatibility**: Inter font has excellent Cyrillic support. For decorative serif, Playfair Display supports Cyrillic well.
2. **Chinese Text**: Chinese characters require larger line-height (1.6–1.8) for readability. Minimum font size for Chinese body text is 14px.
3. **Mixed Text**: When Chinese and Russian text appear together (e.g. user names "Анна 王"), use the primary sans-serif stack — all fonts in that stack support both scripts.
4. **Character Count**: Russian text is ~30% longer than English for the same meaning; Chinese text is ~40% shorter. UI layouts should accommodate this variance.

---

## Spacing System

| Token | Size | Usage |
|-------|------|-------|
| `--space-xs` | 4px | Tiny gaps |
| `--space-sm` | 8px | Small padding |
| `--space-md` | 16px | Standard padding |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 32px | Large sections |
| `--space-2xl` | 48px | Page margins |
| `--space-3xl` | 64px | Hero spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Buttons, inputs |
| `--radius-md` | 12px | Cards, modals |
| `--radius-lg` | 16px | Large containers |
| `--radius-full` | 9999px | Avatars, pill buttons |

---

## Shadows

### Light Mode
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` |
| `--shadow-xl` | `0 12px 40px rgba(0,0,0,0.15)` |

### Dark Mode
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` |
| `--shadow-xl` | `0 12px 40px rgba(0,0,0,0.6)` |

---

## Animation

| Token | Duration | Easing |
|-------|----------|--------|
| `--transition-fast` | 150ms | ease-out |
| `--transition-normal` | 250ms | ease-in-out |
| `--transition-slow` | 400ms | cubic-bezier(0.4, 0, 0.2, 1) |

---

## Cultural Design Elements

### Chinese Influences
- Red and gold color accents
- Circular framing (harmony, completeness)
- Brushstroke-inspired decorative elements
- Cloud and wave patterns (traditional)
- Vertical text layouts for traditional contexts

### Russian Influences
- Blue and white color accents
- Geometric ornamental borders
- Floral / Khokhloma-inspired decorative motifs
- Matryoshka-style nested card designs
- Cyrillic calligraphy accents

### Fusion Elements
- Bridge motif (literal and metaphorical)
- Dual-language everywhere (Chinese + Russian side by side)
- Heart icons blending both cultural aesthetics
- Gradient transitions from red to blue