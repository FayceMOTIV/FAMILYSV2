import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    
    if (session && sessionExpiry) {
      const expiry = new Date(sessionExpiry);
      if (expiry > new Date()) {
        setIsAuthenticated(true);
        setUser({ name: 'Admin', email: 'Le Family\'s' });
      } else {
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_session_expiry');
      }
    }
    setLoading(false);
  }, []);

  const login = async (pin) => {
    try {
      const response = await settingsAPI.get();
      const settings = response.data?.settings || {};
      const storedPin = settings.admin_pin;
      const correctPin = storedPin || '1234';

      if (pin === correctPin) {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        localStorage.setItem('admin_session', 'true');
        localStorage.setItem('admin_session_expiry', expiry.toISOString());
        setIsAuthenticated(true);
        setUser({ name: 'Admin', email: 'Le Family\'s' });
        
        return { success: true };
      } else {
        return { success: false, error: 'Code PIN incorrect' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_session_expiry');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
    user,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
