import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Coins, TrendingUp, Gift, History } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

export default function LoyaltyScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadCashbackData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadCashbackData = async () => {
    try {
      // Récupérer la balance
      const balanceResponse = await axios.get(
        `${API_BASE_URL}/cashback/balance/${user.email}`
      );
      setBalance(balanceResponse.data.balance || 0);

      // Récupérer l'historique
      const historyResponse = await axios.get(
        `${API_BASE_URL}/cashback/history/${user.email}`
      );
      setHistory(historyResponse.data.history || []);
    } catch (error) {
      console.error('Erreur chargement cashback:', error);
      Alert.alert('Erreur', 'Impossible de charger vos données de fidélité');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCashbackData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderLoginPrompt = () => (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="bg-purple-100 rounded-full p-8 mb-6">
        <Coins color="#8B5CF6" size={64} />
      </View>
      
      <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
        Connectez-vous pour accéder à vos récompenses
      </Text>
      
      <Text className="text-base text-gray-500 text-center mb-8">
        Gagnez du cashback sur chaque commande et utilisez-le pour vos prochains achats !
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/(auth)')}
        className="bg-[#C62828] rounded-full px-8 py-4"
      >
        <Text className="text-white text-lg font-semibold">Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#C62828" />
        <Text className="text-gray-500 mt-4">Chargement de votre fidélité...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-[#C62828] pt-12 pb-6 px-6">
          <Text className="text-white text-3xl font-bold">💰 Fidélité</Text>
        </View>
        <ScrollView className="flex-1">
          {renderLoginPrompt()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-[#C62828] pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold">💰 Fidélité</Text>
        <Text className="text-white opacity-90 mt-1">Gagnez et dépensez vos récompenses</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C62828"
          />
        }
      >
        <View className="p-6">
          {/* Carte balance */}
          <View className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-semibold">Votre solde</Text>
              <Coins color="white" size={28} />
            </View>
            
            <Text className="text-white text-5xl font-bold mb-2">
              {balance.toFixed(2)}€
            </Text>
            
            <Text className="text-purple-200 text-sm">
              Disponible immédiatement sur votre prochaine commande
            </Text>

            <TouchableOpacity className="bg-white mt-4 rounded-full py-3 items-center">
              <Text className="text-purple-600 font-bold">Utiliser mon cashback</Text>
            </TouchableOpacity>
          </View>

          {/* Comment ça marche */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              🎁 Comment ça marche ?
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-start">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <TrendingUp color="#059669" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold mb-1">Gagnez du cashback</Text>
                  <Text className="text-gray-600 text-sm">
                    5% de cashback sur chaque commande
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-2 mr-3">
                  <Gift color="#8B5CF6" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold mb-1">Utilisez-le</Text>
                  <Text className="text-gray-600 text-sm">
                    Dépensez votre cashback à tout moment
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Historique */}
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row items-center mb-4">
              <History color="#6B7280" size={24} />
              <Text className="text-xl font-bold text-gray-800 ml-2">Historique</Text>
            </View>

            {history.length === 0 ? (
              <Text className="text-gray-500 text-center py-8">
                Aucune transaction pour le moment
              </Text>
            ) : (
              history.slice(0, 10).map((transaction, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {transaction.type === 'earned' ? 'Cashback gagné' : 'Cashback utilisé'}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  
                  <Text
                    className={`text-lg font-bold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'earned' ? '+' : '-'}
                    {transaction.amount.toFixed(2)}€
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
