import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      // Set hydration state
      setHasHydrated: (state) => {
        set({ _hasHydrated: state, isLoading: false });
      },

      // Initialize auth from storage
      initAuth: async () => {
        try {
          // La persistance Zustand gère automatiquement le chargement
          set({ isLoading: false });
        } catch (error) {
          console.error('Init auth error:', error);
          set({ isLoading: false });
        }
      },

      // Login - Accept user object directly
      login: (userData) => {
        try {
          const mockToken = 'token-' + Date.now();
          set({ 
            token: mockToken, 
            user: userData, 
            isAuthenticated: true,
            isLoading: false
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
    }),
    {
      name: 'familys-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
