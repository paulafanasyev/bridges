import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import LanguageSelector from '../components/LanguageSelector';
import { Language } from '../types';

export default function Landing() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useTranslation();
  const { user } = useAuth();

  // If already logged in, redirect to discover
  React.useEffect(() => {
    if (user) {
      navigate('/discover', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'var(--color-gradient)',
        padding: '60px 24px 40px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ fontSize: '3rem', marginBottom: 16 }}>❤️</div>
        <h1 style={{
          fontSize: 'var(--font-size-4xl)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          {t('landing.title')}
        </h1>
        <p style={{
          fontSize: 'var(--font-size-lg)',
          opacity: 0.9,
          marginBottom: 4,
        }}>
          {t('landing.subtitle')}
        </p>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          opacity: 0.8,
          marginTop: 8,
          maxWidth: 320,
          margin: '12px auto 0',
        }}>
          🇨🇳 ↔ 🇷🇺
        </p>
      </div>

      {/* Language Selection */}
      <div style={{ padding: '24px 24px 0' }}>
        <LanguageSelector current={lang} onChange={setLanguage} />
      </div>

      {/* Description */}
      <div style={{
        padding: '24px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'var(--color-textSecondary)',
          lineHeight: 1.7,
          fontSize: 'var(--font-size-md)',
        }}>
          {t('landing.desc')}
        </p>
      </div>

      {/* Features */}
      <div style={{ padding: '0 24px' }}>
        <h2 style={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: 'var(--font-size-xl)',
          marginBottom: 'var(--space-lg)',
        }}>
          {t('landing.features')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {[
            { icon: '🗣️', title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
            { icon: '🎯', title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
            { icon: '🎨', title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
          ].map((f, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-textSecondary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-lg w-full"
        >
          {t('landing.startNow')}
        </button>
        <button
          onClick={() => navigate('/register')}
          className="btn btn-outline btn-lg w-full"
        >
          {t('auth.registerNow')}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--color-textSecondary)',
        fontSize: 'var(--font-size-xs)',
      }}>
        <p>双心 Bridge | Два Сердца © 2026</p>
        <p style={{ marginTop: 4 }}>Mост между Китаем и Россией</p>
      </div>
    </div>
  );
}