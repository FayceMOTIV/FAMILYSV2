import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Award, MapPin, Phone, Mail, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { getLoyalty } from '../../services/loyalty';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    loadLoyalty();
  }, [isAuthenticated]);
  
  const loadLoyalty = async () => {
    try {
      const response = await getLoyalty();
      setLoyalty(response);
    } catch (error) {
      console.error('Error loading loyalty:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <ScrollView className="flex-1 bg-[#f5f5f5]">
      {/* Header */}
      <View className="bg-[#C62828] px-6 pt-12 pb-8">
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-3">
            <User size={48} color="#C62828" />
          </View>
          <Text className="text-white text-2xl font-bold">
            {user?.name || 'Utilisateur'}
          </Text>
          <Text className="text-white opacity-90 mt-1">
            {user?.email || 'Email non disponible'}
          </Text>
        </View>
      </View>
      
      {/* Loyalty Card */}
      {loyalty && (
        <View className="px-6 -mt-6 mb-4">
          <TouchableOpacity 
            onPress={() => router.push('/loyalty')}
            activeOpacity={0.8}
          >
            <Card className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[#1a1a1a] text-sm font-medium">
                    Carte de fidélité
                  </Text>
                  <Text className="text-[#1a1a1a] text-3xl font-bold mt-1">
                    {loyalty.tier?.name || 'Bronze'}
                  </Text>
                </View>
                <Award size={40} color="#1a1a1a" />
              </View>
              
              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-[#333333] text-sm">
                    Points
                  </Text>
                  <Text className="text-[#1a1a1a] text-2xl font-bold">
                    {loyalty.points?.toFixed(0) || 0}
                  </Text>
                </View>
                <View>
                  <Text className="text-[#333333] text-sm text-right">
                    Valeur
                  </Text>
                  <Text className="text-[#1a1a1a] text-xl font-bold">
                    {loyalty.points_value?.toFixed(2) || '0.00'}€
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Stats */}
      <View className="px-6 mb-4">
        <View className="flex-row">
          <Card className="flex-1 mr-2 p-4">
            <Text className="text-[#666666] text-sm mb-1">
              Commandes
            </Text>
            <Text className="text-[#1a1a1a] text-2xl font-bold">
              {user?.total_orders || 0}
            </Text>
          </Card>
          
          <Card className="flex-1 ml-2 p-4">
            <Text className="text-[#666666] text-sm mb-1">
              Dépensé
            </Text>
            <Text className="text-[#1a1a1a] text-2xl font-bold">
              {user?.total_spent?.toFixed(0) || 0}€
            </Text>
          </Card>
        </View>
      </View>
      
      {/* Info */}
      <View className="px-6 mb-4">
        <Card className="p-4">
          <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
            Informations
          </Text>
          
          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Mail size={20} color="#666666" />
            <Text className="text-[#333333] ml-3 flex-1">
              {user?.email || 'Non renseigné'}
            </Text>
          </View>
          
          {user?.phone && (
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Phone size={20} color="#666666" />
              <Text className="text-[#333333] ml-3 flex-1">
                {user.phone}
              </Text>
            </View>
          )}
          
          {user?.address && (
            <View className="flex-row items-center py-3">
              <MapPin size={20} color="#666666" />
              <Text className="text-[#333333] ml-3 flex-1">
                {user.address}
              </Text>
            </View>
          )}
        </Card>
      </View>
      
      {/* Actions */}
      <View className="px-6 pb-8">
        <Button 
          onPress={handleLogout}
          variant="outline"
          className="mb-3"
        >
          <View className="flex-row items-center">
            <LogOut size={20} color="#C62828" />
            <Text className="text-[#C62828] font-semibold ml-2">
              Déconnexion
            </Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}
