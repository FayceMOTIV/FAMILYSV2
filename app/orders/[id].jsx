import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react-native';
import { getOrder } from '../../services/orders';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';

const statusInfo = {
  pending: { color: 'warning', label: 'En attente', icon: Clock },
  confirmed: { color: 'primary', label: 'Confirmée', icon: Package },
  preparing: { color: 'secondary', label: 'En préparation', icon: Package },
  ready: { color: 'success', label: 'Prête', icon: Package },
  delivered: { color: 'default', label: 'Livrée', icon: Package },
  cancelled: { color: 'error', label: 'Annulée', icon: Package },
};

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadOrder();
  }, [id]);
  
  const loadOrder = async () => {
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (error) {
      Alert.alert('Erreur', 'Commande non trouvée');
      router.back();
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (!order) {
    return null;
  }
  
  const status = statusInfo[order.status] || statusInfo.pending;
  const StatusIcon = status.icon;
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-[#C62828] px-6 pt-12 pb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-white text-3xl font-bold mb-2">
            Commande #{order.id.slice(0, 8)}
          </Text>
          <Text className="text-white text-base opacity-90">
            {formatDate(order.created_at)}
          </Text>
        </View>
        
        {/* Status */}
        <View className="px-6 py-4">
          <Card className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1">
              <View className="bg-[#f5f5f5] w-12 h-12 rounded-full items-center justify-center mr-3">
                <StatusIcon size={24} color="#C62828" />
              </View>
              <View className="flex-1">
                <Text className="text-[#666666] text-sm mb-1">Statut</Text>
                <Text className="text-[#1a1a1a] font-bold text-lg">
                  {status.label}
                </Text>
              </View>
            </View>
            <Badge variant={status.color}>{status.label}</Badge>
          </Card>
        </View>
        
        {/* Items */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
            Articles
          </Text>
          <Card className="p-4">
            {order.items?.map((item, index) => (
              <View 
                key={index}
                className={`flex-row justify-between py-3 ${
                  index < order.items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="font-semibold text-[#1a1a1a] mb-1">
                    {item.quantity}x {item.name}
                  </Text>
                  <Text className="text-[#C62828] font-medium">
                    {item.price?.toFixed(2)}€
                  </Text>
                </View>
                <Text className="font-bold text-[#1a1a1a] text-lg">
                  {item.subtotal?.toFixed(2)}€
                </Text>
              </View>
            ))}
          </Card>
        </View>
        
        {/* Delivery Info */}
        {order.delivery_address && (
          <View className="px-6 pb-4">
            <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
              Livraison
            </Text>
            <Card className="p-4">
              <View className="flex-row items-start">
                <MapPin size={20} color="#666666" className="mt-1" />
                <View className="ml-3 flex-1">
                  <Text className="text-[#666666] text-sm mb-1">Adresse</Text>
                  <Text className="text-[#1a1a1a] font-medium">
                    {order.delivery_address}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
        
        {/* Payment */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
            Paiement
          </Text>
          <Card className="p-4">
            <View className="flex-row items-center mb-3">
              <CreditCard size={20} color="#666666" />
              <Text className="text-[#666666] ml-3">
                {order.payment_method === 'cash' ? 'Espèces' : 'Carte bancaire'}
              </Text>
            </View>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-[#666666]">Sous-total</Text>
              <Text className="font-semibold text-[#1a1a1a]">
                {order.subtotal?.toFixed(2)}€
              </Text>
            </View>
            
            {order.discount > 0 && (
              <View className="flex-row justify-between py-2">
                <Text className="text-[#4CAF50]">Réduction</Text>
                <Text className="font-semibold text-[#4CAF50]">
                  -{order.discount?.toFixed(2)}€
                </Text>
              </View>
            )}
            
            <View className="flex-row justify-between py-3 border-t border-gray-200 mt-2">
              <Text className="text-lg font-bold text-[#1a1a1a]">Total</Text>
              <Text className="text-2xl font-bold text-[#C62828]">
                {order.total?.toFixed(2)}€
              </Text>
            </View>
          </Card>
        </View>
        
        {/* Notes */}
        {order.notes && (
          <View className="px-6 pb-8">
            <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
              Notes
            </Text>
            <Card className="p-4">
              <Text className="text-[#666666]">{order.notes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
