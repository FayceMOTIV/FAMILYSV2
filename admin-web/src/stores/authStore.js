import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('admin_token') || null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
  
  login: (user, token) => {
    localStorage.setItem('admin_token', token)
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('admin_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  updateUser: (user) => set({ user })
}))

export default useAuthStore
