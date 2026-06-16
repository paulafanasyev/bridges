import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useCompatibility } from '../hooks/useCompatibility';
import { User, CHINESE_ZODIAC_NAMES, WESTERN_ZODIAC_NAMES } from '../types';
import { mockApi } from '../services/mockApi';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { user } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');

  const isOwnProfile = id === 'me' || id === user?.id;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getProfile(id);
      setProfile(data);
      if (data) {
        setBio(data.bio || '');
        setUsername(data.username);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      const updated = await mockApi.updateProfile({ bio, username });
      setProfile(updated);
      if (user) {
        // Also update auth context
        mockApi.updateProfile({ bio, username });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="loading-container">
          <p style={{ color: 'var(--color-textSecondary)' }}>{t('common.noData')}</p>
          <button onClick={() => navigate('/discover')} className="btn btn-primary">
            {t('common.back')}
          </button>
        </div>
      </Layout>
    );
  }

  const zodiacCn = CHINESE_ZODIAC_NAMES[profile.zodiac_chinese]?.[lang] || profile.zodiac_chinese;
  const zodiacW = WESTERN_ZODIAC_NAMES[profile.zodiac_western]?.[lang] || profile.zodiac_western;

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          ← {t('common.back')}
        </button>
        {isOwnProfile && (
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="btn btn-primary btn-sm"
          >
            {isEditing ? t('profile.save') : t('profile.edit')}
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="animate-fade-in">
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: 'white',
            fontWeight: 700,
            margin: '0 auto',
          }}>
            {profile.username[0].toUpperCase()}
          </div>

          {isEditing ? (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ textAlign: 'center', fontSize: 'var(--font-size-xl)', fontWeight: 600 }}
              />
            </div>
          ) : (
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginTop: 'var(--space-md)' }}>
              {profile.username}
              {profile.is_premium && <span style={{ marginLeft: 8 }}>⭐</span>}
            </h1>
          )}

          <div className="flex gap-sm" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
            <span className={`badge ${profile.is_online ? 'badge-success' : ''}`}>
              {profile.is_online ? '🟢 ' + t('discover.online') : '⚪ ' + t('discover.offline')}
            </span>
            {profile.is_premium && <span className="badge badge-primary">⭐ Premium</span>}
          </div>
        </div>

        {/* Bio */}
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{t('profile.about')}</h3>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder={t('onboarding.bioPlaceholder')}
              style={{ width: '100%' }}
            />
          ) : (
            <p style={{ color: 'var(--color-textSecondary)', lineHeight: 1.7 }}>
              {profile.bio || t('profile.notSet')}
            </p>
          )}
        </div>

        {/* Zodiac info */}
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{t('profile.zodiac')}</h3>
          <div className="flex gap-md">
            <div style={{ flex: 1, textAlign: 'center', padding: 'var(--space-sm)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🐉</div>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t('landing.chineseZodiac')}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-textSecondary)' }}>{zodiacCn}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: 'var(--space-sm)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>⭐</div>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t('landing.westernZodiac')}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-textSecondary)' }}>{zodiacW}</div>
            </div>
          </div>
        </div>

        {/* Hobbies */}
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{t('profile.hobbies')}</h3>
          {profile.hobbies.length > 0 ? (
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {profile.hobbies.map(hobby => (
                <span key={hobby} className="badge badge-primary">{hobby}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
              {t('profile.notSet')}
            </p>
          )}
        </div>

        {/* Actions for other profiles */}
        {!isOwnProfile && (
          <div className="flex gap-md" style={{ marginTop: 'var(--space-md)' }}>
            <button
              onClick={() => navigate(`/call/${profile.id}`)}
              className="btn btn-primary flex-1 btn-lg"
            >
              📞 {t('discover.sendMessage')}
            </button>
            <button
              onClick={() => mockApi.sendLike(profile.id)}
              className="btn btn-outline btn-lg"
            >
              ❤️
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}