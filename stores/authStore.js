import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Init auth error:', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { access_token, user } = response;
      
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        token: access_token, 
        user, 
        isAuthenticated: true 
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  },

  register: async (email, password, name, phone) => {
    try {
      const response = await authService.register(email, password, name, phone);
      const { access_token, user } = response;
      
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        token: access_token, 
        user, 
        isAuthenticated: true 
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  updateUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
}));
