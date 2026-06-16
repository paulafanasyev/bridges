import { ThemeConfig, ThemeId } from '../types';

// === Male Themes ===

const tigerTheme: ThemeConfig = {
  id: 'tiger',
  name: 'Tiger',
  nameZh: '虎',
  nameRu: 'Тигр',
  gender: 'male',
  description: 'Bold, courageous, and confident — orange and black energy',
  emoji: '🐯',
  colors: {
    primary: '#E8751A',
    secondary: '#FFB347',
    accent: '#2D2D2D',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B6B6B',
    border: '#FFD699',
    gradient: 'linear-gradient(135deg, #E8751A 0%, #FFB347 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#FFFFFF',
    navBg: '#1A1A2E',
    navText: '#FFB347',
  },
};

const dragonTheme: ThemeConfig = {
  id: 'dragon',
  name: 'Dragon',
  nameZh: '龙',
  nameRu: 'Дракон',
  gender: 'male',
  description: 'Powerful, majestic, and ambitious — red and gold energy',
  emoji: '🐉',
  colors: {
    primary: '#C0392B',
    secondary: '#F1C40F',
    accent: '#8B0000',
    background: '#FDF2F2',
    surface: '#FFFFFF',
    text: '#1A0A0A',
    textSecondary: '#7A5C5C',
    border: '#F5C6C6',
    gradient: 'linear-gradient(135deg, #C0392B 0%, #F1C40F 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#FFFFFF',
    navBg: '#1A0A0A',
    navText: '#F1C40F',
  },
};

const phoenixTheme: ThemeConfig = {
  id: 'phoenix',
  name: 'Phoenix',
  nameZh: '凤',
  nameRu: 'Феникс',
  gender: 'male',
  description: 'Resilient, passionate, and transformative — crimson and amber energy',
  emoji: '🦅',
  colors: {
    primary: '#D35400',
    secondary: '#E67E22',
    accent: '#6C3483',
    background: '#FEF5E7',
    surface: '#FFFFFF',
    text: '#1B1B1B',
    textSecondary: '#6E5C4A',
    border: '#FAD7A0',
    gradient: 'linear-gradient(135deg, #D35400 0%, #E67E22 50%, #6C3483 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#FFFFFF',
    navBg: '#1B1B1B',
    navText: '#E67E22',
  },
};

// === Female Themes ===

const sakuraTheme: ThemeConfig = {
  id: 'sakura',
  name: 'Sakura',
  nameZh: '樱',
  nameRu: 'Сакура',
  gender: 'female',
  description: 'Delicate, graceful, and romantic — soft pink and lavender',
  emoji: '🌸',
  colors: {
    primary: '#FF6B9D',
    secondary: '#C39BD3',
    accent: '#F0A8C4',
    background: '#FFF0F5',
    surface: '#FFFFFF',
    text: '#2C1B2D',
    textSecondary: '#8E6C88',
    border: '#FADADD',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C39BD3 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#FFFFFF',
    navBg: '#2C1B2D',
    navText: '#FFB6C1',
  },
};

const lotusTheme: ThemeConfig = {
  id: 'lotus',
  name: 'Lotus',
  nameZh: '莲',
  nameRu: 'Лотос',
  gender: 'female',
  description: 'Pure, elegant, and serene — soft green and rose gold',
  emoji: '🪷',
  colors: {
    primary: '#E8A0BF',
    secondary: '#A8D8B9',
    accent: '#B8A9C9',
    background: '#F5FCF6',
    surface: '#FFFFFF',
    text: '#1E2B1C',
    textSecondary: '#6B7F6B',
    border: '#D4E8D4',
    gradient: 'linear-gradient(135deg, #E8A0BF 0%, #A8D8B9 50%, #B8A9C9 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#FFFFFF',
    navBg: '#1E2B1C',
    navText: '#A8D8B9',
  },
};

const pearlTheme: ThemeConfig = {
  id: 'pearl',
  name: 'Pearl',
  nameZh: '珠',
  nameRu: 'Жемчуг',
  gender: 'female',
  description: 'Luminous, sophisticated, and timeless — ivory and mother of pearl',
  emoji: '🦪',
  colors: {
    primary: '#D4A5A5',
    secondary: '#B8C6D4',
    accent: '#F5E6D3',
    background: '#FEFCF8',
    surface: '#FFFFFF',
    text: '#2D2828',
    textSecondary: '#8A7E7E',
    border: '#E8DDD5',
    gradient: 'linear-gradient(135deg, #D4A5A5 0%, #B8C6D4 50%, #F5E6D3 100%)',
    cardBg: '#FFFFFF',
    buttonText: '#2D2828',
    navBg: '#2D2828',
    navText: '#D4A5A5',
  },
};

export const themes: Record<ThemeId, ThemeConfig> = {
  tiger: tigerTheme,
  dragon: dragonTheme,
  phoenix: phoenixTheme,
  sakura: sakuraTheme,
  lotus: lotusTheme,
  pearl: pearlTheme,
};

export const maleThemeIds: ThemeId[] = ['tiger', 'dragon', 'phoenix'];
export const femaleThemeIds: ThemeId[] = ['sakura', 'lotus', 'pearl'];

export function getThemesByGender(gender: 'male' | 'female'): ThemeConfig[] {
  return gender === 'male'
    ? maleThemeIds.map(id => themes[id])
    : femaleThemeIds.map(id => themes[id]);
}

export function getDefaultThemeForGender(gender: 'male' | 'female'): ThemeConfig {
  return gender === 'male' ? themes.tiger : themes.sakura;
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  const { colors } = theme;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  root.style.setProperty('--theme-gradient', colors.gradient);
  root.style.setProperty('--theme-name', `"${theme.name}"`);
}