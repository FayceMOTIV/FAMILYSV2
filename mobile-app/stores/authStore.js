import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  
  updateUser: (user) => set({ user })
}));

export default useAuthStore;
