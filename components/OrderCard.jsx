import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmée' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'En préparation' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Prête' },
  delivered: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Livrée' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' },
};

export default function OrderCard({ order }) {
  const router = useRouter();
  const status = statusColors[order.status] || statusColors.pending;
  
  const handlePress = () => {
    router.push(`/orders/${order.id}`);
  };
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="bg-white rounded-xl p-4 mb-3"
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-[#1a1a1a] text-base">
            Commande #{order.id.slice(0, 8)}
          </Text>
          <Text className="text-[#666666] text-sm mt-1">
            {formatDate(order.created_at)}
          </Text>
        </View>
        
        <View className={`${status.bg} px-3 py-1 rounded-full`}>
          <Text className={`${status.text} font-semibold text-xs`}>
            {status.label}
          </Text>
        </View>
      </View>
      
      <View className="border-t border-gray-100 pt-2 mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-[#666666] text-sm">
            {order.items?.length || 0} article(s)
          </Text>
          <Text className="font-bold text-[#C62828] text-lg">
            {order.total?.toFixed(2)}€
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
