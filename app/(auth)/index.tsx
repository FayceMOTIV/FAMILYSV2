import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

export default function AuthScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password: password
      });

      if (response.data && response.data.user) {
        login(response.data.user);
        Alert.alert('✅ Connecté', 'Bienvenue !');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Erreur login:', error);
      Alert.alert(
        'Erreur de connexion',
        error.response?.data?.detail || 'Email ou mot de passe incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation des champs obligatoires
    if (!firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est obligatoire');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Erreur', 'L\'adresse est obligatoire');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Le mot de passe est obligatoire');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: email.trim(),
        password: password,
        name: fullName,
        phone: phone.trim(),
        address: address.trim()
      });

      if (response.data && response.data.user) {
        login(response.data.user);
        Alert.alert('✅ Compte créé', 'Bienvenue chez Family\'s !');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Erreur register:', error);
      Alert.alert(
        'Erreur d\'inscription',
        error.response?.data?.detail || 'Impossible de créer le compte'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={styles.subtitle}>
              {isLogin ? 'Bienvenue ! 👋' : 'Créer un compte 🎉'}
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jean"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dupont"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="06 12 34 56 78"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Adresse complète *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    placeholderTextColor="#9CA3AF"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              {!isLogin && (
                <Text style={styles.hint}>Minimum 6 caractères</Text>
              )}
            </View>

            {/* Bouton principal */}
            <TouchableOpacity
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Se connecter' : 'Créer mon compte'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Login/Register */}
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                // Reset form
                setFirstName('');
                setLastName('');
                setPhone('');
                setAddress('');
                setEmail('');
                setPassword('');
              }}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <Text style={styles.switchTextBold}>
                  {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Bouton retour */}
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#C62828',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    fontSize: 15,
    color: '#6B7280',
  },
  switchTextBold: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 15,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
