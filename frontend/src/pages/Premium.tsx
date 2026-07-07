import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';

interface Plan {
  id: string;
  name: string;
  nameZh: string;
  nameRu: string;
  price: number;
  originalPrice?: number;
  period: string;
  periodZh: string;
  periodRu: string;
  badge?: string;
  badgeZh?: string;
  badgeRu?: string;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    nameZh: '月度',
    nameRu: '1 месяц',
    price: 9.99,
    period: '/month',
    periodZh: '/月',
    periodRu: '/мес',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    nameZh: '季度',
    nameRu: '3 месяца',
    price: 24.99,
    originalPrice: 29.97,
    period: '/3 months',
    periodZh: '/季',
    periodRu: '/3 мес',
    badge: 'Popular',
    badgeZh: '热门',
    badgeRu: 'Популярный',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    nameZh: '年度',
    nameRu: '12 месяцев',
    price: 79.99,
    originalPrice: 119.88,
    period: '/year',
    periodZh: '/年',
    periodRu: '/год',
    badge: 'Best Value',
    badgeZh: '最超值',
    badgeRu: 'Лучшая цена',
  },
];

const features: Record<string, Record<string, string>> = {
  translate: { en: 'Unlimited voice translation', zh: '无限语音翻译', ru: 'Безлимитный голосовой перевод' },
  match: { en: 'Advanced compatibility matching', zh: '高级兼容匹配', ru: 'Расширенный подбор совместимости' },
  priority: { en: 'Priority in search results', zh: '搜索结果优先展示', ru: 'Приоритет в результатах поиска' },
  gifts: { en: 'Send virtual gifts', zh: '发送虚拟礼物', ru: 'Отправка виртуальных подарков' },
  ads: { en: 'No advertisements', zh: '无广告', ru: 'Без рекламы' },
  verified: { en: 'Verified profile badge', zh: '认证会员标识', ru: 'Подтверждённый профиль' },
};

const paymentMethods = [
  { id: 'unionpay', name: 'UnionPay', nameZh: '银联', nameRu: 'UnionPay', color: '#E21836', bg: '#FFF0F0' },
  { id: 'alipay', name: 'Alipay', nameZh: '支付宝', nameRu: 'Alipay', color: '#1677FF', bg: '#F0F5FF' },
  { id: 'mir', name: 'MIR', nameZh: 'MIR', nameRu: 'Мир', color: '#1ABC9C', bg: '#F0FFF5' },
];

export default function Premium() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [showSuccess, setShowSuccess] = useState(false);

  const isPremium = user?.is_premium;

  const handleSubscribe = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('premium.title')}</h1>
      </div>

      <p style={{
        color: 'var(--color-textSecondary)',
        textAlign: 'center',
        marginBottom: 'var(--space-xl)',
        fontSize: 'var(--font-size-sm)',
      }}>
        {t('premium.subtitle')}
      </p>

      {/* Current Plan Badge */}
      {isPremium && (
        <div className="card" style={{
          background: 'var(--theme-gradient)',
          color: 'white',
          textAlign: 'center',
          marginBottom: 'var(--space-lg)',
          border: 'none',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⭐</div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Premium Active</div>
          <p style={{ opacity: 0.9, fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            {t('premium.manageSub')}
          </p>
        </div>
      )}

      {/* Plan Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {plans.map((plan, i) => {
          const name = lang === 'zh' ? plan.nameZh : lang === 'ru' ? plan.nameRu : plan.name;
          const badgeText = lang === 'zh' ? plan.badgeZh : lang === 'ru' ? plan.badgeRu : plan.badge;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`card card-interactive animate-fade-in`}
              style={{
                position: 'relative',
                border: selectedPlan === plan.id
                  ? `2px solid var(--color-primary)`
                  : '1px solid var(--color-border)',
                animationDelay: `${i * 0.1}s`,
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              {badgeText && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: -28,
                  background: 'var(--theme-gradient)',
                  color: 'white',
                  padding: '4px 32px',
                  fontSize: '10px',
                  fontWeight: 700,
                  transform: 'rotate(45deg)',
                  letterSpacing: '0.5px',
                }}>
                  {badgeText}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                    <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>${plan.price}</span>
                    <span style={{ color: 'var(--color-textSecondary)', fontSize: 'var(--font-size-sm)' }}>
                      {lang === 'zh' ? plan.periodZh : lang === 'ru' ? plan.periodRu : plan.period}
                    </span>
                  </div>
                  {plan.originalPrice && (
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-textSecondary)',
                      textDecoration: 'line-through',
                      marginTop: 2,
                    }}>
                      ${plan.originalPrice}
                    </div>
                  )}
                </div>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  border: `2px solid ${selectedPlan === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 4,
                }}>
                  {selectedPlan === plan.id && (
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'var(--theme-gradient)',
                    }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="section-title">✨ {t('premium.features')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(features).map(([key, labels]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>✓</span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>
                {labels[lang] || labels.en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="section-title">💳 {t('premium.paymentMethods')}</h3>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          {paymentMethods.map(pm => (
            <div
              key={pm.id}
              className="payment-icon"
              style={{
                background: pm.bg,
                color: pm.color,
                border: `1px solid ${pm.color}20`,
                width: 'auto',
                padding: '6px 14px',
                fontWeight: 600,
              }}
            >
              {pm.name}
              <span style={{ marginLeft: 4, opacity: 0.6, fontWeight: 400 }}>
                {lang === 'zh' ? pm.nameZh : lang === 'ru' ? pm.nameRu : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
        className="btn btn-primary btn-lg w-full"
        style={{ marginBottom: 'var(--space-md)' }}
      >
        {showSuccess ? '✅ ' + t('common.success') + '!' : '⭐ ' + t('premium.subscribe')}
      </button>

      {/* Support */}
      <p style={{
        textAlign: 'center',
        color: 'var(--color-textSecondary)',
        fontSize: 'var(--font-size-xs)',
        marginBottom: 'var(--space-lg)',
      }}>
        🔒 {t('premium.contactSupport')}
      </p>
    </Layout>
  );
}