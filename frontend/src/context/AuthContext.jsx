import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mediassist_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('mediassist_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mediassist_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || 'GUEST',
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
