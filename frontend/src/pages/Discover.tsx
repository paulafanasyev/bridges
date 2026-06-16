import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, Gender } from '../types';
import { mockApi } from '../services/mockApi';

export default function Discover() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, [filterGender]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getDiscoverProfiles({
        gender: filterGender !== 'all' ? filterGender : undefined,
      });
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (profileId: string) => {
    try {
      await mockApi.sendLike(profileId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <h1>{t('discover.title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-ghost btn-sm"
        >
          {showFilters ? '✕' : '⚙️'} {t('discover.filter')}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label className="input-label">{t('discover.gender')}</label>
            <div className="flex gap-sm">
              {['all', 'male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`btn btn-sm flex-1 ${filterGender === g ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {g === 'all' ? t('discover.all') : g === 'male' ? t('onboarding.male') : t('onboarding.female')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile list */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="loading-container">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔍</div>
          <p style={{ color: 'var(--color-textSecondary)' }}>{t('discover.noResults')}</p>
          <button onClick={loadProfiles} className="btn btn-primary">
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <div>
          {profiles.map((profile, i) => (
            <ProfileCard
              key={profile.id}
              profile={{
                ...profile,
                compatibility_score: profile.compatibility_score || Math.floor(Math.random() * 25) + 70,
              }}
              showActions
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}