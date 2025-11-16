import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoyaltyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>⭐ Fidélité</Text>
        <Text style={styles.subtitle}>Programme cashback 5%</Text>
        
        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.balanceLabel}>Solde fidélité</Text>
          <Text style={styles.balanceAmount}>0,00 €</Text>
          <Text style={styles.balanceText}>Utilisable immédiatement</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Historique des transactions</Text>
          <Text style={styles.placeholderText}>À développer...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24
  },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  balanceCard: {
    backgroundColor: '#C62828',
    borderColor: '#FFD54F',
    alignItems: 'center'
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFD54F',
    fontWeight: '600',
    marginBottom: 8
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  balanceText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8
  },
  placeholder: {
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4
  }
});
