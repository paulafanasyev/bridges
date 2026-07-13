import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

export default function Admin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: t('admin.totalUsers'), value: '—', icon: '👥' },
    { label: t('admin.activeUsers'), value: '—', icon: '🟢' },
    { label: t('admin.registrationsToday'), value: '—', icon: '📝' },
    { label: 'Matches Today', value: '—', icon: '💕' },
  ]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyData, setWeeklyData] = useState<number[]>([4, 6, 3, 8, 5, 7, 4]);
  const [monthlyData, setMonthlyData] = useState<number[]>([30, 45, 28, 55, 38, 50, 42, 60, 35, 65, 48, 58]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats([
        { label: t('admin.totalUsers'), value: data.totalUsers ?? '—', icon: '👥' },
        { label: t('admin.activeUsers'), value: data.activeUsers ?? '—', icon: '🟢' },
        { label: t('admin.registrationsToday'), value: data.registrationsToday ?? '—', icon: '📝' },
        { label: 'Matches Today', value: data.matchesToday ?? '—', icon: '💕' },
      ]);
      if (data.registrationsWeekly) setWeeklyData(data.registrationsWeekly);
      if (data.registrationsMonthly) setMonthlyData(data.registrationsMonthly);
    } catch { /* use defaults */ }
    try {
      const userList = await api.getAdminUsers();
      setUsers(userList);
    } catch { /* no users yet */ }
  };

  const chartData = activeTab === 'weekly' ? weeklyData : monthlyData;
  const maxVal = Math.max(...chartData, 1);

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
            <button className={`tab-item ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>{t('admin.weekly')}</button>
            <button className={`tab-item ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>{t('admin.monthly')}</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, paddingTop: 8 }}>
          {chartData.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%',
                height: `${(val / maxVal) * 100}%`,
                minHeight: 4,
                background: 'var(--theme-gradient)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
                opacity: 0.9,
              }} />
              <span style={{ fontSize: '10px', color: 'var(--color-textSecondary)' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="section-title">👤 {t('admin.usersList')}</h3>
        {users.length === 0 ? (
          <p style={{ color: 'var(--color-textSecondary)', textAlign: 'center', padding: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
            {t('admin.noUsers')}
          </p>
        ) : (
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
                {users.map((u: any) => (
                  <tr key={u.id || u.email}>
                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-textSecondary)' }}>{u.email}</td>
                    <td>{u.gender === 'male' ? 'М' : u.gender === 'female' ? 'Ж' : u.gender}</td>
                    <td>{(u.preferred_language || '').toUpperCase()}</td>
                    <td>{u.is_premium ? <span className="badge badge-warning">⭐</span> : <span className="badge">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}