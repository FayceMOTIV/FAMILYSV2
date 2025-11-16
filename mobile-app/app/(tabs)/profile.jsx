import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>👤 Profil</Text>
        <Text style={styles.subtitle}>Mon compte</Text>
        
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Créer un compte</Text>
        </Pressable>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Paramètres utilisateur</Text>
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
  button: {
    backgroundColor: '#C62828',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C62828'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextSecondary: {
    color: '#C62828'
  },
  placeholder: {
    marginTop: 24,
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
