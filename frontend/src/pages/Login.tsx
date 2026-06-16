import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import LanguageSelector from '../components/LanguageSelector';
import { Language } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useTranslation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/discover', { replace: true });
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-background)',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-lg)' }}
      >
        ← {t('common.back')}
      </button>

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>❤️</div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          {t('auth.login')}
        </h1>
        <p style={{ color: 'var(--color-textSecondary)', marginTop: 4 }}>
          {t('app.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label className="input-label">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="demo@dualhearts.com"
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-sm) var(--space-md)',
            background: 'rgba(231, 76, 60, 0.1)',
            color: '#e74c3c',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? t('common.loading') : t('auth.login')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        <p style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ fontWeight: 500 }}>
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <LanguageSelector current={lang} onChange={setLanguage} compact />
      </div>
    </div>
  );
}