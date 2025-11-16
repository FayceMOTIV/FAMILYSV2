import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'

export default function LoyaltyScreen() {
  const balance = 12.45
  const loyaltyRate = 5

  const transactions = [
    { id: '1', type: 'earned', amount: 1.25, date: '15/11/2025', order: 'Commande #1234' },
    { id: '2', type: 'used', amount: -5.00, date: '10/11/2025', order: 'Commande #1230' },
    { id: '3', type: 'earned', amount: 0.95, date: '08/11/2025', order: 'Commande #1225' },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⭐ Fidélité</Text>
          <Text style={styles.subtitle}>Programme cashback {loyaltyRate}%</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={32} color={Colors.secondary} />
            <Text style={styles.balanceLabel}>Solde disponible</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} €</Text>
          <Text style={styles.balanceSubtext}>Utilisable immédiatement</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="star" size={24} color={Colors.secondary} />
            <Text style={styles.infoCardTitle}>{loyaltyRate}% de cashback</Text>
            <Text style={styles.infoCardText}>Sur toutes les commandes</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="flash" size={24} color={Colors.secondary} />
            <Text style={styles.infoCardTitle}>Immédiat</Text>
            <Text style={styles.infoCardText}>Utilisable de suite</Text>
          </View>
        </View>

        {/* Transactions History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Historique</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === 'earned' ? Colors.success : Colors.error }
              ]}>
                <Ionicons 
                  name={transaction.type === 'earned' ? 'arrow-down' : 'arrow-up'} 
                  size={16} 
                  color={Colors.white} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionOrder}>{transaction.order}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'earned' ? Colors.success : Colors.error }
              ]}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}€
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.m,
    color: Colors.gray600,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.l,
    padding: Spacing.xl,
    marginBottom: Spacing.l,
    ...Shadows.large,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  balanceLabel: {
    fontSize: Typography.m,
    color: Colors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 56,
    fontWeight: Typography.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  balanceSubtext: {
    fontSize: Typography.s,
    color: Colors.white,
    opacity: 0.8,
  },
  infoCards: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    alignItems: 'center',
    ...Shadows.small,
  },
  infoCardTitle: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginTop: Spacing.s,
    marginBottom: Spacing.xs,
  },
  infoCardText: {
    fontSize: Typography.s,
    color: Colors.gray600,
    textAlign: 'center',
  },
  historySection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    ...Shadows.small,
  },
  historyTitle: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.l,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionOrder: {
    fontSize: Typography.m,
    fontWeight: Typography.medium,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  transactionDate: {
    fontSize: Typography.s,
    color: Colors.gray500,
  },
  transactionAmount: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
  },
})
