import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { getOrders } from '../../services/orders';
import OrderCard from '../../components/OrderCard';
import Loader from '../../components/Loader';
import Button from '../../components/Button';

export default function Orders() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);
  
  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      {/* Header */}
      <View className="bg-[#C62828] px-6 pt-12 pb-6">
        <Text className="text-white text-3xl font-bold">
          Mes Commandes
        </Text>
        <Text className="text-white text-base opacity-90 mt-1">
          {orders.length} commande(s)
        </Text>
      </View>
      
      {orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">📝</Text>
          <Text className="text-2xl font-bold text-[#1a1a1a] mb-2">
            Aucune commande
          </Text>
          <Text className="text-[#666666] text-center mb-6">
            Vous n'avez pas encore passé de commande
          </Text>
          <Button onPress={() => router.push('/')}>
            Commander maintenant
          </Button>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-6 py-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
