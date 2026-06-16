import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { User, Call as CallType, CallStatus } from '../types';
import TranslationOverlay from './TranslationOverlay';

interface CallInterfaceProps {
  currentUser: User;
  otherUser: User;
  call: CallType | null;
  onEnd: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isIncoming?: boolean;
}

export default function CallInterface({
  currentUser,
  otherUser,
  call,
  onEnd,
  onAccept,
  onReject,
  isIncoming = false,
}: CallInterfaceProps) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (call?.status === 'accepted') {
      setIsCallActive(true);
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [call?.status]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!call) return null;

  // Incoming call screen
  if (isIncoming && call.status === 'requested') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-xl)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: 'white',
          fontWeight: 700,
        }}>
          {otherUser.username[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>{otherUser.username}</h2>
          <p style={{ color: 'var(--color-textSecondary)', marginTop: 4 }}>
            {t('call.incoming')}...
          </p>
        </div>
        <div className="flex gap-md" style={{ gap: 'var(--space-xl)' }}>
          <button
            onClick={onReject}
            className="btn"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: '#e74c3c',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            📞
          </button>
          <button
            onClick={onAccept}
            className="btn"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: '#27ae60',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            📞
          </button>
        </div>
      </div>
    );
  }

  // Active call screen
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 120px)',
      gap: 'var(--space-md)',
    }}>
      {/* Caller info */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-lg) 0',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'white',
          fontWeight: 700,
          margin: '0 auto',
        }}>
          {otherUser.username[0].toUpperCase()}
        </div>
        <h3 style={{ marginTop: 'var(--space-md)', fontWeight: 600 }}>
          {otherUser.username}
        </h3>
        <p style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
          {isCallActive ? formatDuration(duration) : t('call.connecting')}
        </p>
        
        {/* Call status indicator */}
        {isCallActive && (
          <div className="flex gap-sm" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
            <span className="badge badge-success" style={{ animation: 'pulse 2s ease infinite' }}>
              🟢 {t('discover.online')}
            </span>
          </div>
        )}
      </div>

      {/* Translation overlay */}
      <div style={{ flex: 1, minHeight: 300 }}>
        <TranslationOverlay
          currentUser={currentUser}
          otherUser={otherUser}
          isCallActive={isCallActive}
        />
      </div>

      {/* Call controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-md) 0',
      }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="btn"
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-full)',
            background: isMuted ? '#3498db' : 'var(--color-background)',
            color: isMuted ? 'white' : 'var(--color-text)',
            fontSize: '1.25rem',
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={onEnd}
          className="btn"
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            background: '#e74c3c',
            color: 'white',
            fontSize: '1.5rem',
          }}
        >
          📞
        </button>

        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className="btn"
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-full)',
            background: isSpeakerOn ? '#3498db' : 'var(--color-background)',
            color: isSpeakerOn ? 'white' : 'var(--color-text)',
            fontSize: '1.25rem',
          }}
        >
          🔊
        </button>
      </div>
    </div>
  );
}