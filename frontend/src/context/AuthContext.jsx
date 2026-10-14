import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('spendsense_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            setStoredToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          setStoredToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function login(email, password) {
    const res = await api.login({ email, password });
    if (res.success && res.token && res.user) {
      setStoredToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Authentication failed');
  }

  async function register(name, email, password) {
    const res = await api.register({ name, email, password });
    if (res.success && res.token && res.user) {
      setStoredToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
  }

  async function updateProfile(data) {
    const res = await api.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
