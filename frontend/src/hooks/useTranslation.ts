import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import i18n from '../i18n';

export function useTranslation() {
  const [lang, setLang] = useState<Language>(i18n.language);

  useEffect(() => {
    const unsub = i18n.subscribe((newLang) => {
      setLang(newLang);
    });
    i18n.initialize();
    return unsub;
  }, []);

  const t = useCallback((path: string, params?: Record<string, string | number>) => {
    return i18n.t(path, params);
  }, [lang]);

  const setLanguage = useCallback((l: Language) => {
    i18n.setLanguage(l);
  }, []);

  return { t, lang, setLanguage };
}