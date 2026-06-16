import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';

interface LanguageSelectorProps {
  current: Language;
  onChange: (lang: Language) => void;
  compact?: boolean;
}

export default function LanguageSelector({ current, onChange, compact = false }: LanguageSelectorProps) {
  const { t } = useTranslation();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  if (compact) {
    return (
      <div className="flex gap-sm" style={{ gap: 4 }}>
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`btn btn-sm ${current === lang.code ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '4px 8px',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <label className="input-label">{t('settings.selectLanguage')}</label>
      <div className="flex gap-sm">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`btn flex-1 ${current === lang.code ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: 'var(--space-md)' }}
          >
            <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}