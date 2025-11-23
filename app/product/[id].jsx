import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Minus } from 'lucide-react-native';
import { getProduct } from '../../services/products';
import { useCartStore } from '../../stores/cartStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    loadProduct();
  }, [id]);
  
  const loadProduct = async () => {
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch (error) {
      Alert.alert('Erreur', 'Produit non trouvé');
      router.back();
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = () => {
    setAdding(true);
    addItem(product, quantity);
    
    setTimeout(() => {
      setAdding(false);
      Alert.alert(
        'Ajouté au panier',
        `${quantity}x ${product.name} ajouté(s)`,
        [
          { text: 'Continuer', onPress: () => router.back() },
          { text: 'Voir le panier', onPress: () => router.push('/cart') }
        ]
      );
    }, 500);
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (!product) {
    return null;
  }
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <ScrollView className="flex-1">
        {/* Image */}
        <View className="relative">
          {product.image ? (
            <Image 
              source={{ uri: product.image }} 
              className="w-full h-80"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-80 bg-gray-300 items-center justify-center">
              <Text className="text-8xl">🍔</Text>
            </View>
          )}
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-6 bg-white/90 w-10 h-10 rounded-full items-center justify-center"
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          {!product.available && (
            <View className="absolute top-12 right-6 bg-red-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">Épuisé</Text>
            </View>
          )}
        </View>
        
        {/* Details */}
        <View className="px-6 py-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-[#1a1a1a] mb-2">
                {product.name}
              </Text>
              <View className="bg-gray-200 self-start px-3 py-1 rounded-full">
                <Text className="text-[#666666] font-medium">
                  {product.category}
                </Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-[#C62828]">
              {product.price?.toFixed(2)}€
            </Text>
          </View>
          
          {product.description && (
            <Card className="mb-6">
              <Text className="text-[#666666] leading-6">
                {product.description}
              </Text>
            </Card>
          )}
          
          {/* Quantity Selector */}
          <Card className="mb-6">
            <Text className="text-lg font-bold text-[#1a1a1a] mb-3">
              Quantité
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 w-12 h-12 rounded-full items-center justify-center"
              >
                <Minus size={24} color="#333333" />
              </TouchableOpacity>
              
              <Text className="mx-8 text-2xl font-bold">
                {quantity}
              </Text>
              
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                className="bg-gray-200 w-12 h-12 rounded-full items-center justify-center"
              >
                <Plus size={24} color="#333333" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-[#666666]">
            Total
          </Text>
          <Text className="text-2xl font-bold text-[#C62828]">
            {(product.price * quantity).toFixed(2)}€
          </Text>
        </View>
        
        <Button 
          onPress={handleAddToCart}
          loading={adding}
          disabled={!product.available}
          size="lg"
        >
          {product.available ? 'Ajouter au panier' : 'Produit non disponible'}
        </Button>
      </View>
    </View>
  );
}
