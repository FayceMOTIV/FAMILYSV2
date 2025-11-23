import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, TrendingUp, Gift } from 'lucide-react-native';
import { getLoyalty, getLoyaltyHistory } from '../services/loyalty';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Loader from '../components/Loader';

export default function LoyaltyCard() {
  const router = useRouter();
  
  const [loyalty, setLoyalty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [loyaltyRes, historyRes] = await Promise.all([
        getLoyalty(),
        getLoyaltyHistory(0, 20)
      ]);
      setLoyalty(loyaltyRes);
      setHistory(historyRes.history || []);
    } catch (error) {
      console.error('Error loading loyalty:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (!loyalty) {
    return null;
  }
  
  const tierProgress = loyalty.next_tier 
    ? ((loyalty.points / (loyalty.points + loyalty.next_tier.points_needed)) * 100).toFixed(0)
    : 100;
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] px-6 pt-12 pb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-[#1a1a1a] text-3xl font-bold mb-2">
              Carte de Fidélité
            </Text>
            <Text className="text-[#333333]">
              {loyalty.customer_name}
            </Text>
          </View>
        </View>
        
        {/* Tier Card */}
        <View className="px-6 -mt-8 mb-4">
          <Card className="p-6">
            <View className="items-center">
              <View 
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: loyalty.tier?.color || '#666666' }}
              >
                <Award size={48} color="white" />
              </View>
              
              <Text className="text-3xl font-bold text-[#1a1a1a] mb-1">
                {loyalty.tier?.name}
              </Text>
              
              <Badge variant="secondary" className="mb-4">
                {loyalty.tier?.discount}% de réduction
              </Badge>
              
              <View className="flex-row items-end mb-2">
                <Text className="text-5xl font-bold text-[#C62828]">
                  {loyalty.points?.toFixed(0)}
                </Text>
                <Text className="text-xl text-[#666666] ml-2 mb-2">points</Text>
              </View>
              
              <Text className="text-[#666666] text-lg">
                = {loyalty.points_value?.toFixed(2)}€
              </Text>
            </View>
          </Card>
        </View>
        
        {/* Progress to Next Tier */}
        {loyalty.next_tier && (
          <View className="px-6 mb-4">
            <Card className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-[#1a1a1a]">
                  Prochain niveau: {loyalty.next_tier.name}
                </Text>
                <Text className="text-[#C62828] font-semibold">
                  {tierProgress}%
                </Text>
              </View>
              
              <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-[#C62828]"
                  style={{ width: `${tierProgress}%` }}
                />
              </View>
              
              <Text className="text-[#666666] text-sm mt-2">
                Plus que {loyalty.next_tier.points_needed} points pour atteindre {loyalty.next_tier.name}
              </Text>
            </Card>
          </View>
        )}
        
        {/* Stats */}
        <View className="px-6 mb-4">
          <View className="flex-row">
            <Card className="flex-1 mr-2 p-4">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#C62828" />
                <Text className="text-[#666666] text-sm ml-2">Commandes</Text>
              </View>
              <Text className="text-2xl font-bold text-[#1a1a1a]">
                {loyalty.total_orders}
              </Text>
            </Card>
            
            <Card className="flex-1 ml-2 p-4">
              <View className="flex-row items-center mb-2">
                <Gift size={20} color="#C62828" />
                <Text className="text-[#666666] text-sm ml-2">Dépensé</Text>
              </View>
              <Text className="text-2xl font-bold text-[#1a1a1a]">
                {loyalty.total_spent?.toFixed(0)}€
              </Text>
            </Card>
          </View>
        </View>
        
        {/* QR Code Section */}
        <View className="px-6 mb-4">
          <Card className="p-6">
            <Text className="text-lg font-bold text-[#1a1a1a] mb-4 text-center">
              Code QR de Fidélité
            </Text>
            <View className="items-center bg-white p-4 rounded-lg">
              <View className="w-48 h-48 bg-gray-200 rounded-lg items-center justify-center">
                <Text className="text-4xl">📱</Text>
                <Text className="text-[#666666] text-xs mt-2 text-center">
                  QR Code{'\n'}(à scanner en caisse)
                </Text>
              </View>
              <Text className="text-[#666666] text-xs mt-3">
                ID: {loyalty.qr_code?.slice(0, 8)}
              </Text>
            </View>
          </Card>
        </View>
        
        {/* History */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold text-[#1a1a1a] mb-3">
            Historique des points
          </Text>
          
          {history.length === 0 ? (
            <Card className="p-6">
              <Text className="text-[#666666] text-center">
                Aucun historique de points
              </Text>
            </Card>
          ) : (
            history.map((item) => (
              <Card key={item.order_id} className="mb-3 p-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-[#1a1a1a] mb-1">
                      {item.description}
                    </Text>
                    <Text className="text-[#666666] text-sm">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text className="text-[#4CAF50] font-bold text-lg">
                    +{item.points} pts
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
