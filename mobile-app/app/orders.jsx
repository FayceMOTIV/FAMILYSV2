import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme'
import Header from '../components/Header'
import Button from '../components/Button'
import SkeletonLoader from '../components/SkeletonLoader'
import useAuthStore from '../stores/authStore'
import api from '../services/api'

const OrderCard = ({ order, onPress }) => {
  const statusConfig = {
    new: { label: 'Nouvelle', color: Colors.info, icon: 'time' },
    in_preparation: { label: 'En préparation', color: Colors.warning, icon: 'restaurant' },
    ready: { label: 'Prête', color: Colors.success, icon: 'checkmark-circle' },
    completed: { label: 'Terminée', color: Colors.gray600, icon: 'checkmark-done' },
    canceled: { label: 'Annulée', color: Colors.error, icon: 'close-circle' },
  }
  
  const status = statusConfig[order.status] || statusConfig.new
  const date = new Date(order.created_at)
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderCard,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId}>Commande #{order.id?.slice(0, 8) || 'N/A'}</Text>
          <Text style={styles.orderDate}>
            {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Ionicons name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      
      <View style={styles.orderContent}>
        <View style={styles.orderItems}>
          <Text style={styles.itemsText}>
            {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'article' : 'articles'}
          </Text>
        </View>
        
        <View style={styles.orderFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>{(order.total || 0).toFixed(2)}€</Text>
          </View>
          
          {order.cashback_earned && order.cashback_earned > 0 && (
            <View style={styles.cashbackContainer}>
              <Ionicons name="wallet" size={14} color={Colors.success} />
              <Text style={styles.cashbackText}>+{order.cashback_earned.toFixed(2)}€</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
      </View>
    </Pressable>
  )
}

export default function OrdersScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // all, active, completed
  
  useEffect(() => {
    if (user?.email) {
      fetchOrders()
    }
  }, [user?.email])
  
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/customer/${user.email}`)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }
  
  const handleOrderPress = (orderId) => {
    router.push(`/order-detail/${orderId}`)
  }
  
  const handleLoginPress = () => {
    router.push('/auth/login')
  }
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['new', 'in_preparation', 'ready'].includes(order.status)
    } else if (filter === 'completed') {
      return ['completed', 'canceled'].includes(order.status)
    }
    return true
  })
  
  // Empty state when not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Mes commandes" showBack />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={64} color={Colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>Connecte-toi pour voir tes commandes</Text>
          <Text style={styles.emptyText}>
            Accède à l'historique de toutes tes commandes
          </Text>
          <Button
            title="Se connecter"
            onPress={handleLoginPress}
            icon={<Ionicons name="log-in" size={20} color={Colors.white} />}
          />
        </View>
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Mes commandes" showBack />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Toutes</Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('active')}
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>En cours</Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('completed')}
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Terminées</Text>
        </Pressable>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={120} style={{ marginBottom: Spacing.m }} />
          <SkeletonLoader height={120} style={{ marginBottom: Spacing.m }} />
          <SkeletonLoader height={120} />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>📦</Text>
          </View>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>
            {filter === 'all' ? "Tu n'as pas encore passé de commande" : `Aucune commande ${filter === 'active' ? 'en cours' : 'terminée'}`}
          </Text>
          <Button
            title="Commander maintenant"
            onPress={() => router.push('/menu')}
            icon={<Ionicons name="restaurant" size={20} color={Colors.white} />}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: Spacing.l,
    gap: Spacing.m,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.m,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  filterTextActive: {
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  loadingContainer: {
    padding: Spacing.l,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.medium,
    position: 'relative',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.m,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  orderDate: {
    fontSize: Typography.s,
    color: Colors.gray600,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.s,
  },
  statusText: {
    fontSize: Typography.s,
    fontWeight: Typography.semibold,
  },
  orderContent: {
    marginBottom: Spacing.m,
  },
  orderItems: {
    marginBottom: Spacing.m,
  },
  itemsText: {
    fontSize: Typography.m,
    color: Colors.gray700,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  priceLabel: {
    fontSize: Typography.m,
    color: Colors.gray600,
  },
  priceValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.success + '10',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.s,
  },
  cashbackText: {
    fontSize: Typography.s,
    fontWeight: Typography.semibold,
    color: Colors.success,
  },
  arrow: {
    position: 'absolute',
    right: Spacing.l,
    top: '50%',
    marginTop: -10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyIcon: {
    marginBottom: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  emptyText: {
    fontSize: Typography.m,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
})
