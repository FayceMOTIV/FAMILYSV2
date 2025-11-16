import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import useCartStore from '../../stores/cartStore'
import useLoyaltyStore from '../../stores/loyaltyStore'
import useAuthStore from '../../stores/authStore'

const API_URL = 'https://react-native-reboot.preview.emergentagent.com/api/v1'

export default function CartScreen() {
  const router = useRouter()
  const { items, incrementQuantity, decrementQuantity } = useCartStore()
  const { balance, loyaltyPercentage } = useLoyaltyStore()
  const { user } = useAuthStore()
  
  const [useCashback, setUseCashback] = useState(false)
  const [cashbackPreview, setCashbackPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cashbackEarned = (subtotal * (loyaltyPercentage / 100)).toFixed(2)
  
  // Fetch cashback preview
  useEffect(() => {
    if (items.length > 0 && user) {
      loadCashbackPreview()
    }
  }, [items, useCashback, user])
  
  const loadCashbackPreview = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/cashback/preview`, {
        customer_id: user.id || user.email,
        subtotal: subtotal,
        total_after_promos: subtotal,
        promo_discount: 0,
        use_cashback: useCashback
      })
      
      setCashbackPreview(response.data)
      console.log('💰 Cashback preview loaded:', response.data)
    } catch (error) {
      console.error('❌ Error loading cashback preview:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getFinalTotal = () => {
    if (cashbackPreview && useCashback) {
      return cashbackPreview.remaining_to_pay || subtotal
    }
    return subtotal
  }
  
  const canUseCashback = balance >= 10

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Panier</Text>
        <Badge text={`${items.length} articles`} variant="primary" size="small" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items */}
        <View style={styles.cartItems}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.options.length > 0 && (
                  <Text style={styles.itemOptions}>{item.options.join(', ')}</Text>
                )}
                <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
              </View>
              
              <View style={styles.quantityControl}>
                <Pressable style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </Pressable>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Pressable style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Cashback Info */}
        <View style={styles.cashbackInfo}>
          <View style={styles.cashbackIcon}>
            <Ionicons name="star" size={24} color={Colors.secondary} />
          </View>
          <View style={styles.cashbackText}>
            <Text style={styles.cashbackTitle}>Cashback sur cette commande</Text>
            <Text style={styles.cashbackAmount}>+{cashbackEarned}€</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{subtotal.toFixed(2)}€</Text>
        </View>
        <Button
          title="Passer à la caisse"
          onPress={() => router.push('/checkout')}
          fullWidth
        />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  cartItems: {
    gap: Spacing.m,
  },
  cartItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Shadows.small,
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
  itemOptions: {
    fontSize: Typography.s,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.s,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    minWidth: 24,
    textAlign: 'center',
  },
  cashbackInfo: {
    marginTop: Spacing.l,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  cashbackIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashbackText: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: Typography.s,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  cashbackAmount: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.l,
    ...Shadows.large,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  totalLabel: {
    fontSize: Typography.l,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  totalAmount: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
})
