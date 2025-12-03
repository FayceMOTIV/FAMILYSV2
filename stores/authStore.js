import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Initialize auth from storage
  initAuth: async () => {
    try {
      set({ isLoading: false });
    } catch (error) {
      console.error('Init auth error:', error);
      set({ isLoading: false });
    }
  },

  // Login - Accept user object directly
  login: (userData) => {
    try {
      const mockToken = 'mock-token-' + Date.now();
      set({ 
        token: mockToken, 
        user: userData, 
        isAuthenticated: true 
      });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Update user
  updateUser: (userData) => {
    const user = { ...get().user, ...userData };
    set({ user });
  },
}));
