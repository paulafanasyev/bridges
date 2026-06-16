import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Language, ThemeId } from '../types';

export default function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const { currentTheme, switchTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleThemeChange = (themeId: ThemeId) => {
    switchTheme(themeId);
    if (user) {
      const updated = { ...user, theme_id: themeId };
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const userGender = user?.gender || 'male';

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('settings.title')}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Language */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            🌐 {t('settings.language')}
          </h3>
          <LanguageSelector current={lang} onChange={setLanguage} />
        </div>

        {/* Theme */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            🎨 {t('settings.theme')}
          </h3>
          <ThemeSelector
            current={currentTheme.id}
            gender={userGender as 'male' | 'female'}
            onSelect={handleThemeChange}
          />
        </div>

        {/* Account info */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            👤 {t('settings.account')}
          </h3>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
                  {t('auth.username')}
                </span>
                <span style={{ fontWeight: 500 }}>{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
                  {t('auth.email')}
                </span>
                <span style={{ fontWeight: 500 }}>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
                  {t('settings.premium')}
                </span>
                <span className={`badge ${user.is_premium ? 'badge-primary' : ''}`}>
                  {user.is_premium ? '⭐ Premium' : t('settings.upgrade')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Premium upsell */}
        {user && !user.is_premium && (
          <div className="card" style={{
            background: 'var(--color-gradient)',
            color: 'white',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>⭐</div>
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
              {t('settings.upgrade')} Premium
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--space-md)' }}>
              {t('call.translationOn')} · {t('discover.compatibility')} max · No ads
            </p>
            <button className="btn" style={{
              background: 'white',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}>
              {t('settings.upgrade')}
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-outline w-full"
          style={{ borderColor: '#e74c3c', color: '#e74c3c' }}
        >
          🚪 {t('nav.logout')}
        </button>

        {/* Version */}
        <div style={{ textAlign: 'center', color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-xs)' }}>
          <p>{t('settings.version')} 1.0.0</p>
          <p style={{ marginTop: 4 }}>双心 Bridge | Два Сердца © 2026</p>
        </div>
      </div>
    </Layout>
  );
}