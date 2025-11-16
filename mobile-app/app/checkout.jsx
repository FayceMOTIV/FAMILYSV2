import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme'
import Button from '../components/Button'
import Badge from '../components/Badge'
import useCartStore from '../stores/cartStore'
import useLoyaltyStore from '../stores/loyaltyStore'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, getSubtotal, getTax, getTotal, getCashbackEarned } = useCartStore()
  const { loyaltyPercentage } = useLoyaltyStore()
  
  const subtotal = getSubtotal()
  const tax = getTax()
  const total = getTotal()
  const cashbackEarned = getCashbackEarned(loyaltyPercentage / 100)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💳 Commande</Text>
        </View>

        {/* Order Type (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de commande</Text>
          <View style={styles.orderTypeButtons}>
            <View style={[styles.orderTypeButton, styles.orderTypeButtonActive]}>
              <Ionicons name="bag-handle" size={24} color={Colors.primary} />
              <Text style={[styles.orderTypeText, styles.orderTypeTextActive]}>À emporter</Text>
            </View>
            <View style={styles.orderTypeButton}>
              <Ionicons name="bicycle" size={24} color={Colors.gray400} />
              <Text style={styles.orderTypeText}>Livraison</Text>
            </View>
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)}€</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (10%)</Text>
            <Text style={styles.totalValue}>{tax.toFixed(2)}€</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{total.toFixed(2)}€</Text>
          </View>
        </View>

        {/* Cashback Info */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackIcon}>
            <Ionicons name="star" size={24} color={Colors.secondary} />
          </View>
          <View style={styles.cashbackContent}>
            <Text style={styles.cashbackTitle}>Cashback sur cette commande</Text>
            <Text style={styles.cashbackAmount}>Vous gagnerez +{cashbackEarned.toFixed(2)}€</Text>
          </View>
        </View>

        {/* Delivery/Pickup Info (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoPlaceholder}>
            <Text style={styles.placeholderText}>
              À développer : formulaire livraison/pickup
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Passer la commande"
          onPress={() => {
            // TODO: Create order
            console.log('📦 Order placed')
          }}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    marginBottom: Spacing.l,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.m,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  orderTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.l,
    borderRadius: BorderRadius.m,
    borderWidth: 2,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  orderTypeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  orderTypeText: {
    fontSize: Typography.s,
    color: Colors.gray600,
    fontWeight: Typography.medium,
    marginTop: Spacing.xs,
  },
  orderTypeTextActive: {
    color: Colors.primary,
  },
  itemsList: {
    gap: Spacing.m,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  itemQuantity: {
    fontSize: Typography.s,
    color: Colors.gray600,
    fontWeight: Typography.semibold,
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.m,
    color: Colors.gray900,
  },
  itemPrice: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  totalRowFinal: {
    marginTop: Spacing.m,
    paddingTop: Spacing.m,
    borderTopWidth: 2,
    borderTopColor: Colors.gray200,
  },
  totalLabel: {
    fontSize: Typography.m,
    color: Colors.gray600,
  },
  totalValue: {
    fontSize: Typography.m,
    fontWeight: Typography.medium,
    color: Colors.gray900,
  },
  totalLabelFinal: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  totalValueFinal: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  cashbackCard: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  cashbackIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashbackContent: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: Typography.s,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  cashbackAmount: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  infoPlaceholder: {
    backgroundColor: Colors.gray50,
    padding: Spacing.xl,
    borderRadius: BorderRadius.m,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.s,
    color: Colors.gray500,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    ...Shadows.large,
  },
})
