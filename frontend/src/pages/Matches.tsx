import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { Match } from '../types';
import { mockApi } from '../services/mockApi';

export default function Matches() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getMatches();
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('discover.matches')}</h1>
        <span className="badge badge-primary" style={{ fontSize: 'var(--font-size-sm)' }}>
          {matches.length}
        </span>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="loading-container">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>💕</div>
          <p style={{ color: 'var(--color-textSecondary)' }}>{t('discover.noResults')}</p>
          <button onClick={() => navigate('/discover')} className="btn btn-primary">
            {t('landing.startNow')}
          </button>
        </div>
      ) : (
        <div>
          {matches.map(match => match.matched_user && (
            <ProfileCard
              key={match.id}
              profile={{
                ...match.matched_user,
                compatibility_score: match.compatibility_score,
              }}
              showActions
              onLike={() => navigate(`/call/${match.matched_user?.id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}