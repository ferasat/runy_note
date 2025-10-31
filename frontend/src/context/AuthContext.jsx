import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, clearAuthToken } from '../utils/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'eitaa-notebook-token';
const USER_KEY = 'eitaa-notebook-user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      clearAuthToken();
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      setToken,
      setUser,
      logout: () => {
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
