import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🏠 Accueil - Family's</Text>
        <Text style={styles.subtitle}>Bienvenue dans l'app mobile</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 React Native + Expo</Text>
          <Text style={styles.cardText}>Architecture propre et moderne</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Prêt pour le développement</Text>
          <Text style={styles.cardText}>Navigation, API client, State management configurés</Text>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280'
  }
});
