import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, Plus, Minus } from 'lucide-react-native';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { createOrder } from '../../services/orders';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Cart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }
  
  const total = getTotal();
  
  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de commander');
      return;
    }
    
    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse requise', 'Veuillez entrer votre adresse de livraison');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        options: item.options
      }));
      
      const response = await createOrder({
        items: orderItems,
        delivery_address: deliveryAddress,
        delivery_method: 'delivery',
        payment_method: 'cash',
        notes: notes,
        use_loyalty_points: false
      });
      
      if (response.success) {
        clearCart();
        Alert.alert(
          'Commande confirmée !', 
          `Votre commande a été passée avec succès.\nVous avez gagné ${response.points_earned} points !`,
          [
            { text: 'Voir mes commandes', onPress: () => router.push('/orders') },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de passer la commande. Réessayez.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <View className="flex-1 bg-[#f5f5f5] justify-center items-center px-6">
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className="text-2xl font-bold text-[#1a1a1a] mb-2">
          Votre panier est vide
        </Text>
        <Text className="text-[#666666] text-center mb-6">
          Ajoutez des produits pour commencer votre commande
        </Text>
        <Button onPress={() => router.push('/')}>
          Découvrir nos produits
        </Button>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="bg-[#C62828] px-6 pt-12 pb-6">
          <Text className="text-white text-3xl font-bold">
            Mon Panier
          </Text>
          <Text className="text-white text-base opacity-90 mt-1">
            {items.length} article(s)
          </Text>
        </View>
        
        {/* Cart Items */}
        <View className="px-6 py-4">
          {items.map((item, index) => (
            <Card key={`${item.product.id}-${index}`} className="mb-3">
              <View className="flex-row">
                {item.product.image ? (
                  <Image 
                    source={{ uri: item.product.image }} 
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                    <Text className="text-2xl">🍔</Text>
                  </View>
                )}
                
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-[#1a1a1a] text-base mb-1">
                    {item.product.name}
                  </Text>
                  <Text className="text-[#C62828] font-bold text-lg mb-2">
                    {item.product.price?.toFixed(2)}€
                  </Text>
                  
                  {/* Quantity Controls */}
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1, item.options)}
                      className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Minus size={16} color="#333333" />
                    </TouchableOpacity>
                    
                    <Text className="mx-4 font-semibold text-base">
                      {item.quantity}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1, item.options)}
                      className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Plus size={16} color="#333333" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => removeItem(item.product.id, item.options)}
                      className="ml-auto"
                    >
                      <Trash2 size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
        
        {/* Delivery Details */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
            Détails de livraison
          </Text>
          
          <Input
            label="Adresse de livraison"
            placeholder="123 Rue de Paris, 75001 Paris"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            className="mb-2"
          />
          
          <Input
            label="Notes (optionnel)"
            placeholder="Instructions spéciales..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-[#666666]">
            Total
          </Text>
          <Text className="text-2xl font-bold text-[#C62828]">
            {total.toFixed(2)}€
          </Text>
        </View>
        
        <Button 
          onPress={handleCheckout}
          loading={loading}
          size="lg"
        >
          Commander
        </Button>
      </View>
    </View>
  );
}
