import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const readStoredAuth = () => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser),
    };
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    authService.logout();
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const syncAuthState = () => {
    const storedAuth = readStoredAuth();
    setUser(storedAuth.user);
    setIsAuthenticated(Boolean(storedAuth.token && storedAuth.user));
    return storedAuth.user;
  };

  useEffect(() => {
    syncAuthState();
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    showToast({
      type: 'success',
      title: 'Signed in successfully',
      message: data.user?.name ? `Welcome back, ${data.user.name}.` : 'You can continue to your dashboard now.',
    });
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    setIsAuthenticated(true);
    showToast({
      type: 'success',
      title: 'Account created',
      message: `Your ${data.user?.role || payload.role} account is ready.`,
    });
    return data;
  };

  const logout = (options = {}) => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);

    if (!options.silent) {
      showToast({
        type: 'info',
        title: 'Logged out',
        message: 'You have been signed out of your account.',
      });
    }
  };

  const refreshAuth = () => {
    const nextUser = syncAuthState();
    return nextUser;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshAuth,
      isAuthenticated,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
