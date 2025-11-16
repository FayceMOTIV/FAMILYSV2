import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const response = await authAPI.login(credentials)
          const { access_token, user } = response.data
          
          set({ 
            user, 
            token: access_token, 
            isAuthenticated: true, 
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Erreur de connexion'
          set({ error: errorMessage, loading: false })
          return { success: false, error: errorMessage }
        }
      },
      
      signup: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await authAPI.signup(userData)
          const { access_token, user } = response.data
          
          set({ 
            user, 
            token: access_token, 
            isAuthenticated: true, 
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Erreur d\'inscription'
          set({ error: errorMessage, loading: false })
          return { success: false, error: errorMessage }
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (user) => set({ user }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useAuthStore
