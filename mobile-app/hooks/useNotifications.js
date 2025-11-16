import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://react-native-reboot.preview.emergentagent.com/api/v1'

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notifications/${userId}`)
        const notifs = response.data.notifications || []
        setNotifications(notifs)
        
        const unread = notifs.filter(n => !n.is_read).length
        setUnreadCount(unread)
        console.log(`📬 Fetched ${notifs.length} notifications (${unread} unread)`)
      } catch (error) {
        console.error('❌ Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [userId])

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`)
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
      console.log('✅ Notification marked as read:', notificationId)
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    
    try {
      await axios.post(`${API_URL}/notifications/${userId}/mark-all-read`)
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      console.log('✅ All notifications marked as read')
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: () => {
      if (userId) {
        setLoading(true)
        // Will trigger useEffect
      }
    }
  }
}
