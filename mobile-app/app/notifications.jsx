import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme'
import useAuthStore from '../stores/authStore'
import useNotificationStore from '../stores/notificationStore'
import SkeletonLoader from '../components/SkeletonLoader'

const getIcon = (type) => {
  switch (type) {
    case 'loyalty_credited':
      return <Ionicons name="star" size={24} color={Colors.secondary} />
    case 'order_confirmed':
      return <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
    case 'order_ready':
      return <Ionicons name="bag-check" size={24} color={Colors.success} />
    case 'promo_available':
      return <Ionicons name="gift" size={24} color={Colors.error} />
    default:
      return <Ionicons name="notifications" size={24} color={Colors.info} />
  }
}

export default function NotificationsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id || user.email)
    }
  }, [user])

  const onRefresh = async () => {
    setRefreshing(true)
    if (user) {
      await fetchNotifications(user.id || user.email)
    }
    setRefreshing(false)
  }

  const handleNotificationPress = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    // Navigate based on notification type
    if (notification.type === 'order_confirmed' || notification.type === 'order_ready') {
      router.push('/(tabs)/profile')
    }
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} height={100} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllAsRead(user?.id || user?.email)} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </Pressable>
        )}
        {unreadCount === 0 && <View style={styles.placeholder} />}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>Vos notifications apparaîtront ici</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.notificationUnread
              ]}
            >
              <View style={[
                styles.iconContainer,
                notification.type === 'loyalty_credited' && styles.iconContainerGold,
                notification.type === 'promo_available' && styles.iconContainerRed,
              ]}>
                {getIcon(notification.type)}
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.is_read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>
                  {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  markAllButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
  },
  markAllText: {
    fontSize: Typography.s,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  placeholder: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  content: {
    padding: Spacing.l,
  },
  empty: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.l,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.s,
  },
  emptyText: {
    fontSize: Typography.m,
    color: Colors.gray500,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    flexDirection: 'row',
    gap: Spacing.m,
    ...Shadows.small,
  },
  notificationUnread: {
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerGold: {
    backgroundColor: Colors.secondary + '20',
  },
  iconContainerRed: {
    backgroundColor: Colors.error + '20',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notificationMessage: {
    fontSize: Typography.s,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  notificationDate: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
})
