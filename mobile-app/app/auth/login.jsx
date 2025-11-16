import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔑 Connexion</Text>
        <Text style={styles.subtitle}>Bienvenue chez Family's</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/auth/signup')}>
          <Text style={styles.linkText}>Pas encore de compte ? Inscrivez-vous</Text>
        </Pressable>
      </View>
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
    marginBottom: 32
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  button: {
    backgroundColor: '#C62828',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  linkText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center'
  }
});
