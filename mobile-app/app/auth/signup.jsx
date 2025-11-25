import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography } from '../../constants/theme'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useAuthStore from '../../stores/authStore'

export default function SignupScreen() {
  const router = useRouter()
  const { signup, loading, clearError } = useAuthStore()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!firstName.trim()) {
      newErrors.firstName = 'Prénom requis'
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Nom requis'
    }
    
    if (!email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide'
    }
    
    if (!password) {
      newErrors.password = 'Mot de passe requis'
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    clearError()
    
    if (!validateForm()) {
      return
    }
    
    const result = await signup({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    })
    
    if (result.success) {
      console.log('✅ Signup successful')
      Alert.alert('Succès', 'Compte créé avec succès !')
      router.replace('/(tabs)')
    } else {
      Alert.alert('Erreur', result.error || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Rejoignez Family's</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
              error={errors.firstName}
            />

            <Input
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Dupont"
              error={errors.lastName}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="jean.dupont@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Créer mon compte"
              onPress={handleSignup}
              loading={loading}
              fullWidth
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Button
              title="Se connecter"
              onPress={() => router.back()}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.l,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.m,
    color: Colors.gray600,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.m,
    color: Colors.gray600,
    marginBottom: Spacing.s,
  },
})
