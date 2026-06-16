import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import i18n from './i18n';
import './index.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Call from './pages/Call';
import Settings from './pages/Settings';
import Matches from './pages/Matches';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { switchTheme } = useTheme();

  useEffect(() => {
    i18n.initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/discover"
        element={isAuthenticated ? <Discover /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/matches"
        element={isAuthenticated ? <Matches /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile/:id"
        element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/call/:userId"
        element={isAuthenticated ? <Call /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}