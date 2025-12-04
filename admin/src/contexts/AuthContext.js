import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // AUTHENTICATION DISABLED FOR PREVIEW
  const [user, setUser] = useState({
    email: 'admin@familys.app',
    first_name: 'Admin',
    last_name: 'Preview',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-login for preview mode
    const fakeUser = {
      email: 'admin@familys.app',
      first_name: 'Admin',
      last_name: 'Preview',
      role: 'admin'
    };
    
    localStorage.setItem('admin_token', 'preview-mode-token');
    localStorage.setItem('admin_user', JSON.stringify(fakeUser));
    setUser(fakeUser);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
