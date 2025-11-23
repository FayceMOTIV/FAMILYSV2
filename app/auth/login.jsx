import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleLogin = async () => {
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email requis';
    if (!password) newErrors.password = 'Mot de passe requis';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-[#f5f5f5]"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo/Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-[#C62828] mb-2">
              Family's
            </Text>
            <Text className="text-lg text-[#666666]">
              Bienvenue !
            </Text>
          </View>
          
          {/* Form */}
          <View className="mb-6">
            <Input
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
          </View>
          
          {/* Buttons */}
          <Button 
            onPress={handleLogin}
            loading={loading}
            className="mb-4"
          >
            Se connecter
          </Button>
          
          <Button 
            onPress={() => router.push('/auth/register')}
            variant="outline"
          >
            Créer un compte
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
