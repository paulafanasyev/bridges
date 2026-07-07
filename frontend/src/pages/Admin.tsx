import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  gender: string;
  language: string;
  premium: boolean;
  joined: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([
    { label: t('admin.totalUsers'), value: 847, icon: '👥' },
    { label: t('admin.activeUsers'), value: 42, icon: '🟢' },
    { label: t('admin.registrationsToday'), value: 12, icon: '📝' },
    { label: 'Matches Today', value: 28, icon: '💕' },
  ]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [users] = useState<UserRow[]>([
    { id: 'u1', username: 'Алексей', email: 'aleksey@example.com', gender: 'М', language: 'RU', premium: true, joined: '2025-01-15' },
    { id: 'u2', username: '小明', email: 'xiaoming@example.com', gender: 'М', language: 'ZH', premium: false, joined: '2025-03-20' },
    { id: 'u3', username: 'Анна', email: 'anna@example.com', gender: 'Ж', language: 'RU', premium: true, joined: '2025-02-10' },
    { id: 'u4', username: '小芳', email: 'xiaofang@example.com', gender: 'Ж', language: 'ZH', premium: false, joined: '2025-04-05' },
    { id: 'u5', username: 'Dmitry', email: 'dmitry@example.com', gender: 'М', language: 'EN', premium: true, joined: '2025-05-01' },
    { id: 'u6', username: '丽华', email: 'lihua@example.com', gender: 'Ж', language: 'ZH', premium: false, joined: '2025-06-15' },
    { id: 'u7', username: 'Elena', email: 'elena@example.com', gender: 'Ж', language: 'RU', premium: false, joined: '2025-07-01' },
    { id: 'u8', username: '伟强', email: 'weiqiang@example.com', gender: 'М', language: 'ZH', premium: true, joined: '2025-08-10' },
  ]);

  const weeklyData = [5, 8, 3, 12, 7, 9, 4];
  const monthlyData = [42, 58, 35, 72, 48, 63, 55, 70, 45, 82, 68, 77];

  const maxVal = Math.max(...(activeTab === 'weekly' ? weeklyData : monthlyData));

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('admin.title')}</h1>
        <span className="badge badge-primary" style={{ fontSize: 'var(--font-size-xs)' }}>Admin</span>
      </div>

      {/* Stats Grid */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-lg)' }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Registration Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>📊 {t('admin.registrations')}</h3>
          <div className="tab-bar" style={{ width: 'auto' }}>
            <button
              className={`tab-item ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              {t('admin.weekly')}
            </button>
            <button
              className={`tab-item ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              {t('admin.monthly')}
            </button>
          </div>
        </div>

        {/* Chart bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, paddingTop: 8 }}>
          {(activeTab === 'weekly' ? weeklyData : monthlyData).map((val, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{
                width: '100%',
                height: `${(val / maxVal) * 100}%`,
                minHeight: 4,
                background: 'var(--theme-gradient)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
                opacity: 0.9,
              }} />
              <span style={{ fontSize: '10px', color: 'var(--color-textSecondary)' }}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="section-title">👤 {t('admin.usersList')}</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('admin.username')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.gender')}</th>
                <th>{t('admin.language')}</th>
                <th>{t('admin.premium')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.username}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-textSecondary)' }}>{u.email}</td>
                  <td>{u.gender}</td>
                  <td>{u.language}</td>
                  <td>
                    {u.premium
                      ? <span className="badge badge-warning">⭐</span>
                      : <span className="badge">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}