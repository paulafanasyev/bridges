import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { CHINESE_ZODIAC_NAMES, WESTERN_ZODIAC_NAMES } from '../types';
import { getCompatColor, getCompatEmoji } from '../utils/compatibility';

interface ProfileCardProps {
  profile: UserProfile;
  showActions?: boolean;
  onLike?: (id: string) => void;
}

export default function ProfileCard({ profile, showActions = false, onLike }: ProfileCardProps) {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const compatScore = profile.compatibility_score ?? 0;
  const compatColor = getCompatColor(compatScore);
  const compatEmoji = getCompatEmoji(compatScore);

  const zodiacChineseName = CHINESE_ZODIAC_NAMES[profile.zodiac_chinese]?.[lang] || profile.zodiac_chinese;
  const zodiacWesternName = WESTERN_ZODIAC_NAMES[profile.zodiac_western]?.[lang] || profile.zodiac_western;

  return (
    <div
      className="card card-interactive animate-fade-in"
      onClick={() => navigate(`/profile/${profile.id}`)}
      style={{ marginBottom: 'var(--space-md)' }}
    >
      <div className="flex items-center gap-md">
        {/* Avatar */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            background: `var(--color-gradient)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            flexShrink: 0,
            fontWeight: 700,
            overflow: 'hidden',
          }}
        >
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profile.username[0].toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-sm">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{profile.username}</h3>
            {profile.is_premium && <span className="badge badge-primary">⭐</span>}
            <span className={`badge ${profile.is_online ? 'badge-success' : 'badge-secondary'}`}>
              {profile.is_online ? '🟢' : '⚪'}
            </span>
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-textSecondary)', marginTop: 4 }}>
            {zodiacChineseName} · {zodiacWesternName}
          </div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-textSecondary)',
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 200,
          }}>
            {profile.bio || t('profile.notSet')}
          </p>
        </div>

        {/* Compatibility */}
        {compatScore > 0 && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              fontSize: '1.5rem',
              lineHeight: 1,
            }}>
              {compatEmoji}
            </div>
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: compatColor,
              marginTop: 2,
            }}>
              {compatScore}%
            </div>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-textSecondary)',
            }}>
              {t('discover.compatWith')}
            </div>
          </div>
        )}
      </div>

      {/* Hobbies */}
      {profile.hobbies.length > 0 && (
        <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {profile.hobbies.slice(0, 4).map(hobby => (
            <span key={hobby} className="badge badge-primary" style={{ fontSize: 'var(--font-size-xs)' }}>
              {hobby}
            </span>
          ))}
          {profile.hobbies.length > 4 && (
            <span className="badge" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-textSecondary)' }}>
              +{profile.hobbies.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-sm" style={{ marginTop: 'var(--space-md)' }}>
          <button
            className="btn btn-primary flex-1 btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/call/${profile.id}`);
            }}
          >
            📞 {t('discover.sendMessage')}
          </button>
          {onLike && (
            <button
              className="btn btn-outline btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onLike(profile.id);
              }}
            >
              ❤️ {t('discover.like')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}