import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { Gender, Language } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.confirmPassword') + ' mismatch');
      return;
    }

    if (!birthDate) {
      setError(t('onboarding.birthDate') + ' required');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username,
        email,
        password,
        gender,
        birth_date: birthDate,
        preferred_language: 'en',
      });
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
          {t('auth.register')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label className="input-label">{t('auth.username')}</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('onboarding.gender')}</label>
          <div className="flex gap-sm">
            {(['male', 'female', 'other'] as Gender[]).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`btn flex-1 ${gender === g ? 'btn-primary' : 'btn-secondary'}`}
              >
                {g === 'male' ? t('onboarding.male') : g === 'female' ? t('onboarding.female') : t('onboarding.other')}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('onboarding.birthDate')}</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
        >
          {isLoading ? t('common.loading') : t('auth.registerNow')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        <p style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>
            {t('auth.loginNow')}
          </Link>
        </p>
      </div>
    </div>
  );
}