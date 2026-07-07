import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const { t } = useTranslation();

  const navItems = [
    { path: '/discover', icon: '🔍', label: t('nav.discover') },
    { path: '/matches', icon: '💕', label: t('nav.matches') },
    { path: '/premium', icon: '⭐', label: 'Premium' },
    { path: '/profile/me', icon: '👤', label: t('nav.profile') },
    { path: '/settings', icon: '⚙️', label: t('nav.settings') },
  ];

  return (
    <div className="app-layout">
      <main className="page-container">
        {children}
      </main>
      {showNav && (
        <nav className="bottom-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}