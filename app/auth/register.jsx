import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function Register() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleRegister = async () => {
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email requis';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    if (formData.password.length < 6) newErrors.password = 'Min 6 caractères';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.name) newErrors.name = 'Nom requis';
    if (!formData.phone) newErrors.phone = 'Téléphone requis';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const result = await register(
      formData.email, 
      formData.password, 
      formData.name, 
      formData.phone
    );
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
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        <View className="px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-[#C62828] mb-2">
              Créer un compte
            </Text>
            <Text className="text-base text-[#666666]">
              Rejoignez Family's dès maintenant !
            </Text>
          </View>
          
          {/* Form */}
          <View>
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              value={formData.name}
              onChangeText={(v) => handleChange('name', v)}
              error={errors.name}
            />
            
            <Input
              label="Email"
              placeholder="votre@email.com"
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            
            <Input
              label="Téléphone"
              placeholder="06 12 34 56 78"
              value={formData.phone}
              onChangeText={(v) => handleChange('phone', v)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            
            <Input
              label="Mot de passe"
              placeholder="Min 6 caractères"
              value={formData.password}
              onChangeText={(v) => handleChange('password', v)}
              secureTextEntry
              error={errors.password}
            />
            
            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>
          
          {/* Buttons */}
          <Button 
            onPress={handleRegister}
            loading={loading}
            className="mb-4 mt-2"
          >
            S'inscrire
          </Button>
          
          <Button 
            onPress={() => router.back()}
            variant="ghost"
          >
            Déjà un compte ? Se connecter
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
