import { create } from 'zustand'
import axios from 'axios'

const API_URL = 'https://react-reborn.preview.emergentagent.com/api/v1'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  fetchNotifications: async (userId) => {
    if (!userId) return
    
    set({ loading: true, error: null })
    
    try {
      const response = await axios.get(`${API_URL}/notifications/${userId}`)
      const notifs = response.data.notifications || []
      const unread = notifs.filter(n => !n.is_read).length
      
      set({ 
        notifications: notifs, 
        unreadCount: unread,
        loading: false 
      })
      
      console.log(`📬 Fetched ${notifs.length} notifications (${unread} unread)`)
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erreur de chargement des notifications'
      set({ error: errorMessage, loading: false })
      console.error('❌ Error fetching notifications:', errorMessage)
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`)
      
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
      
      console.log('✅ Notification marked as read')
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
    }
  },
  
  markAllAsRead: async (userId) => {
    if (!userId) return
    
    try {
      await axios.post(`${API_URL}/notifications/${userId}/mark-all-read`)
      
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }))
      
      console.log('✅ All notifications marked as read')
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
    }
  },
  
  clearError: () => set({ error: null }),
}))

export default useNotificationStore
