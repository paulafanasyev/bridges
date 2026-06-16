import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThemeConfig, ThemeId } from '../types';
import { themes, maleThemeIds, femaleThemeIds } from '../themes';

interface ThemeSelectorProps {
  current: ThemeId;
  gender: 'male' | 'female';
  onSelect: (themeId: ThemeId) => void;
}

function ThemeCard({ theme, isActive, onClick }: { theme: ThemeConfig; isActive: boolean; onClick: () => void }) {
  const { t, lang } = useTranslation();
  const name = lang === 'zh' ? theme.nameZh : lang === 'ru' ? theme.nameRu : theme.name;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: isActive ? `3px solid var(--color-primary)` : `3px solid transparent`,
        transition: 'all var(--transition-fast)',
        boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      {/* Theme preview */}
      <div
        style={{
          height: 80,
          background: theme.colors.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}
      >
        {theme.emoji}
      </div>
      {/* Theme info */}
      <div
        style={{
          padding: 'var(--space-sm) var(--space-md)',
          background: theme.colors.cardBg,
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{name}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-textSecondary)', marginTop: 2 }}>
          {theme.description}
        </div>
      </div>
    </div>
  );
}

export default function ThemeSelector({ current, gender, onSelect }: ThemeSelectorProps) {
  const { t } = useTranslation();
  const themeIds = gender === 'male' ? maleThemeIds : femaleThemeIds;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label">{gender === 'male' ? t('onboarding.maleThemes') : t('onboarding.femaleThemes')}</label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
        {themeIds.map(id => (
          <ThemeCard
            key={id}
            theme={themes[id]}
            isActive={current === id}
            onClick={() => onSelect(id)}
          />
        ))}
      </div>
    </div>
  );
}