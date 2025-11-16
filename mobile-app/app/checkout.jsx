import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>💳 Commande</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Formulaire de commande</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24
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
