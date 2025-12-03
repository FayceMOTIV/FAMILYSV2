import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../constants';

function formatCurrency(amount) {
  const safe = Number(amount) || 0;
  return `${safe.toFixed(2).replace('.', ',')} €`;
}

export default function LoyaltyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { balance, rate, history } = useMemo(() => {
    const rawBalance =
      user?.cashback_balance ??
      user?.cashback ??
      user?.loyaltyBalance ??
      0;

    const rawRate =
      user?.cashback_rate ??
      user?.cashbackRate ??
      user?.loyaltyRate ??
      5;

    const rawHistory =
      user?.cashback_history ??
      user?.cashbackHistory ??
      [];

    return {
      balance: Number(rawBalance) || 0,
      rate: Number(rawRate) || 0,
      history: Array.isArray(rawHistory) ? rawHistory : [],
    };
  }, [user]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>Mes récompenses</Text>
      <Text style={styles.subtitle}>
        À chaque commande, une partie de ce que tu dépenses revient dans ta cagnotte.
      </Text>

      {/* Carte solde */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde fidélité</Text>
        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>

        {rate > 0 && (
          <Text style={styles.balanceRate}>
            {rate}% de cashback sur chaque commande éligible
          </Text>
        )}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Text style={styles.ctaText}>Utiliser mon solde</Text>
        </TouchableOpacity>
      </View>

      {/* Bloc explication */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Comment ça marche ?</Text>
        <Text style={styles.infoText}>
          1. Passe une commande dans l&apos;app Family&apos;s.{'\n'}
          2. Tu gagnes automatiquement du cashback sur ton compte.{'\n'}
          3. Utilise ton solde pour payer une partie de ta prochaine commande.
        </Text>
      </View>

      {/* Historique */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historique de mes gains</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun gain pour le moment</Text>
          <Text style={styles.emptyText}>
            Passe ta première commande pour commencer à remplir ta cagnotte fidélité.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {history.map((item, index) => (
            <View key={item.id || index} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyLabel}>
                  +{formatCurrency(item.amount)}
                </Text>
                <Text style={styles.historyOrder}>
                  {item.label || `Commande #${item.orderNumber || '—'}`}
                </Text>
              </View>
              <Text style={styles.historyDate}>
                {item.date || ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  balanceRate: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  ctaButton: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  historyHeader: {
    marginTop: 4,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  historyLeft: {
    flexShrink: 1,
    paddingRight: 8,
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  historyOrder: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
