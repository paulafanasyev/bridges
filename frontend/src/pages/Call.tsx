import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import CallInterface from '../components/CallInterface';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { User, Call as CallType } from '../types';
import { mockApi } from '../services/mockApi';

export default function Call() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [call, setCall] = useState<CallType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (userId) {
      loadOtherUser();
    }
  }, [userId, user]);

  const loadOtherUser = async () => {
    setIsLoading(true);
    try {
      const profile = await mockApi.getProfile(userId);
      if (profile && profile.id !== user?.id) {
        setOtherUser(profile);
        // Initiate call
        const newCall = await mockApi.initiateCall(profile.id);
        setCall(newCall);
      } else {
        setError(t('common.noData'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    setCall(prev => prev ? {
      ...prev,
      status: 'ended',
      ended_at: new Date().toISOString(),
    } : null);
    navigate('/discover');
  };

  const handleAccept = () => {
    setCall(prev => prev ? {
      ...prev,
      status: 'accepted',
      started_at: new Date().toISOString(),
    } : null);
  };

  const handleReject = () => {
    navigate('/discover');
  };

  if (isLoading) {
    return (
      <Layout showNav={false}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !otherUser || !user) {
    return (
      <Layout showNav={false}>
        <div className="loading-container">
          <p style={{ color: 'var(--color-textSecondary)' }}>{error || t('common.error')}</p>
          <button onClick={() => navigate('/discover')} className="btn btn-primary">
            {t('common.back')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <CallInterface
        currentUser={user}
        otherUser={otherUser}
        call={call}
        onEnd={handleEndCall}
        onAccept={handleAccept}
        onReject={handleReject}
        isIncoming={false}
      />
    </Layout>
  );
}