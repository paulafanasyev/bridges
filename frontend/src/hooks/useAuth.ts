import { useState, useCallback, useEffect } from 'react';
import { User, AuthTokens, LoginRequest, RegisterRequest, Language } from '../types';
import { mockApi } from '../services/mockApi';
import i18n from '../i18n';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    const savedTokens = localStorage.getItem('tokens');
    if (savedUser && savedTokens) {
      try {
        const user = JSON.parse(savedUser);
        const tokens = JSON.parse(savedTokens);
        setAuth({ user, tokens, isAuthenticated: true, isLoading: false });
        i18n.setLanguage(user.preferred_language || 'en');
      } catch {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setAuth(prev => ({ ...prev, isLoading: true }));
    try {
      const { user, tokens } = await mockApi.login(data);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
      i18n.setLanguage(user.preferred_language);
      setAuth({ user, tokens, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      setAuth(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setAuth(prev => ({ ...prev, isLoading: true }));
    try {
      const { user, tokens } = await mockApi.register(data);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
      i18n.setLanguage(user.preferred_language);
      setAuth({ user, tokens, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      setAuth(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setAuth({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuth(prev => ({ ...prev, user: updatedUser }));
  }, []);

  return { ...auth, login, register, logout, updateUser };
}