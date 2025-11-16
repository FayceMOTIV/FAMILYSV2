import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import Header from '../../components/Header'
import Button from '../../components/Button'
import SkeletonLoader from '../../components/SkeletonLoader'
import useCartStore from '../../stores/cartStore'
import useAuthStore from '../../stores/authStore'
import api from '../../services/api'

export default function OrderDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { user } = useAuthStore()
  const { addItem, clearCart } = useCartStore()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchOrderDetail()
  }, [id])
  
  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order detail:', error)
      Alert.alert('Erreur', 'Impossible de charger les détails de la commande')
      router.back()
    } finally {
      setLoading(false)
    }
  }
  
  const handleReorder = async () => {
    if (!order || !order.items) return
    
    Alert.alert(
      'Recommander',
      'Voulez-vous vider votre panier et recommander ces articles ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Recommander',
          onPress: async () => {
            try {
              // Clear cart
              clearCart()
              
              // Fetch product details for each item and add to cart
              for (const item of order.items) {
                try {
                  const productResponse = await api.get(`/products/${item.product_id}`)
                  const product = productResponse.data
                  
                  addItem({
                    ...product,
                    quantity: item.quantity,
                    selectedOptions: item.options || {},
                    notes: item.notes || ''
                  })
                } catch (err) {
                  console.error(`Failed to fetch product ${item.product_id}:`, err)
                }
              }
              
              Alert.alert('Succès', 'Articles ajoutés au panier')
              router.push('/cart')
            } catch (error) {
              console.error('Error reordering:', error)
              Alert.alert('Erreur', 'Impossible de recommander')
            }
          }
        }
      ]
    )
  }
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Détail commande" showBack />
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={100} style={{ marginBottom: Spacing.m }} />
          <SkeletonLoader height={200} style={{ marginBottom: Spacing.m }} />
          <SkeletonLoader height={150} />
        </View>
      </SafeAreaView>
    )
  }
  
  if (!order) {
    return null
  }
  
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Détail commande" showBack />
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderId}>Commande #{order.id?.slice(0, 8) || 'N/A'}</Text>
              <Text style={styles.orderDate}>
                {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Ionicons name={status.icon} size={20} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>
        
        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={Colors.gray600} />
            <Text style={styles.infoText}>{order.customer_name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={Colors.gray600} />
            <Text style={styles.infoText}>{order.customer_email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={Colors.gray600} />
            <Text style={styles.infoText}>{order.customer_phone || 'N/A'}</Text>
          </View>
          {order.delivery_address && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={Colors.gray600} />
              <Text style={styles.infoText}>{order.delivery_address}</Text>
            </View>
          )}
        </View>
        
        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
            </View>
          ))}
        </View>
        
        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{(order.total || 0).toFixed(2)}€</Text>
          </View>
          
          {order.cashback_used && order.cashback_used > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>
                Cashback utilisé
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -{order.cashback_used.toFixed(2)}€
              </Text>
            </View>
          )}
          
          {order.cashback_earned && order.cashback_earned > 0 && (
            <View style={[styles.summaryRow, styles.cashbackRow]}>
              <View style={styles.cashbackLeft}>
                <Ionicons name="wallet" size={18} color={Colors.success} />
                <Text style={styles.cashbackLabel}>Cashback gagné</Text>
              </View>
              <Text style={styles.cashbackValue}>+{order.cashback_earned.toFixed(2)}€</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{(order.total || 0).toFixed(2)}€</Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <Ionicons name="card" size={18} color={Colors.gray600} />
            <Text style={styles.paymentText}>
              Payé par {order.payment_method || 'Carte bancaire'}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          title="Recommander"
          onPress={handleReorder}
          icon={<Ionicons name="refresh" size={20} color={Colors.white} />}
          fullWidth
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  loadingContainer: {
    padding: Spacing.l,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: Typography.xl,
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
    gap: Spacing.s,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.m,
  },
  statusText: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
  },
  sectionTitle: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    marginBottom: Spacing.m,
  },
  infoText: {
    fontSize: Typography.m,
    color: Colors.gray700,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.m,
    flex: 1,
  },
  itemQuantity: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.primary,
    minWidth: 30,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  itemNotes: {
    fontSize: Typography.s,
    color: Colors.gray600,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  summaryLabel: {
    fontSize: Typography.m,
    color: Colors.gray700,
  },
  summaryValue: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  cashbackRow: {
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  cashbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  cashbackLabel: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.success,
  },
  cashbackValue: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: Spacing.m,
  },
  totalLabel: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  totalValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginTop: Spacing.m,
    padding: Spacing.m,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.m,
  },
  paymentText: {
    fontSize: Typography.s,
    color: Colors.gray700,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    ...Shadows.large,
  },
})
