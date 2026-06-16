import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ThemeSelector from '../components/ThemeSelector';
import { Gender, ThemeId, Language, HOBBY_OPTIONS, ZodiacChinese, ZodiacWestern } from '../types';
import { getZodiacsFromDate } from '../utils/zodiac';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useTranslation();
  const { user, updateUser, login } = useAuth();
  const { currentTheme, switchTheme } = useTheme();

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(user?.username || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'male');
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user?.hobbies || []);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(user?.preferred_language || lang);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(user?.theme_id || currentTheme.id);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  const toggleHobby = (hobbyId: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobbyId)
        ? prev.filter(h => h !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { chinese, western } = getZodiacsFromDate(birthDate);
      
      if (user) {
        const updatedUser = {
          ...user,
          username,
          gender,
          birth_date: birthDate,
          zodiac_chinese: chinese,
          zodiac_western: western,
          hobbies: selectedHobbies,
          bio,
          preferred_language: selectedLanguage,
          theme_id: selectedTheme,
        };
        updateUser(updatedUser);
      }

      // Apply theme
      switchTheme(selectedTheme);
      setLanguage(selectedLanguage);

      navigate('/discover', { replace: true });
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Basic Info
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">{t('auth.username')}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t('auth.username')}
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
              <label className="input-label">{t('onboarding.preferredLanguage')}</label>
              <div className="flex gap-sm">
                {(['zh', 'ru', 'en'] as Language[]).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSelectedLanguage(l)}
                    className={`btn flex-1 ${selectedLanguage === l ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {l === 'zh' ? '🇨🇳 中文' : l === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{t('onboarding.bio')}</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={t('onboarding.bioPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        );

      case 1: // Hobbies
        return (
          <div className="animate-fade-in">
            <p style={{
              color: 'var(--color-textSecondary)',
              marginBottom: 'var(--space-md)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {t('onboarding.selectHobbies')}
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
            }}>
              {HOBBY_OPTIONS.map(hobby => {
                const label = hobby[lang] || hobby.en;
                const isSelected = selectedHobbies.includes(hobby.id);
                return (
                  <button
                    key={hobby.id}
                    onClick={() => toggleHobby(hobby.id)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{label}
                  </button>
                );
              })}
            </div>
            {selectedHobbies.length > 0 && (
              <p style={{
                marginTop: 'var(--space-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-textSecondary)',
              }}>
                {t('onboarding.selectHobbies')}: {selectedHobbies.length}
              </p>
            )}
          </div>
        );

      case 2: // Theme selection
        return (
          <div className="animate-fade-in">
            <p style={{
              color: 'var(--color-textSecondary)',
              marginBottom: 'var(--space-md)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {t('onboarding.themeDescription')}
            </p>
            <ThemeSelector
              current={selectedTheme}
              gender={gender === 'female' ? 'female' : 'male'}
              onSelect={(themeId) => {
                setSelectedTheme(themeId);
                switchTheme(themeId);
              }}
            />
          </div>
        );
    }
  };

  return (
    <Layout showNav={false}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Step indicator */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
            {t('onboarding.title')}
          </h1>
          <div className="flex gap-sm" style={{ gap: 'var(--space-sm)' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? 'var(--color-gradient)' : 'var(--color-border)',
                  transition: 'background var(--transition-normal)',
                }}
              />
            ))}
          </div>
          <p style={{
            marginTop: 'var(--space-sm)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-textSecondary)',
          }}>
            {t(`onboarding.step${step + 1}`)}
          </p>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex gap-md" style={{ marginTop: 'var(--space-xl)' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn btn-secondary flex-1"
              disabled={isLoading}
            >
              {t('onboarding.back')}
            </button>
          )}
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn btn-primary flex-1"
              disabled={
                (step === 0 && (!username || !birthDate)) ||
                (step === 1 && selectedHobbies.length === 0)
              }
            >
              {t('onboarding.next')}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('onboarding.complete')}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}