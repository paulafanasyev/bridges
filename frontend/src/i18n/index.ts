import { Language } from '../types';
import zh from './zh';
import ru from './ru';
import en from './en';

type TranslationDict = typeof en;

const translations: Record<Language, TranslationDict> = { zh, ru, en };

class I18n {
  private currentLang: Language = 'en';
  private listeners: Array<(lang: Language) => void> = [];

  get language(): Language {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    this.currentLang = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ru' ? 'ru' : 'en';
    }
    this.listeners.forEach(fn => fn(lang));
  }

  initialize() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_language') as Language | null;
      if (saved && ['zh', 'ru', 'en'].includes(saved)) {
        this.currentLang = saved;
      } else {
        // Detect browser language
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === 'zh' || browserLang === 'ru') {
          this.currentLang = browserLang;
        }
      }
      document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : this.currentLang === 'ru' ? 'ru' : 'en';
    }
  }

  subscribe(fn: (lang: Language) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.');
    let result: unknown = translations[this.currentLang];
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }

    if (typeof result !== 'string') {
      // Fallback to English
      let fallback: unknown = translations['en'];
      for (const key of keys) {
        if (fallback && typeof fallback === 'object' && key in fallback) {
          fallback = (fallback as Record<string, unknown>)[key];
        } else {
          return path;
        }
      }
      result = fallback;
    }

    if (typeof result !== 'string') return path;

    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, key) => {
        const val = params[key];
        return val !== undefined ? String(val) : `{${key}}`;
      });
    }

    return result;
  }
}

export const i18n = new I18n();
export default i18n;