import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductCard({ product }) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="bg-white rounded-xl p-3 mr-3 w-40"
      activeOpacity={0.8}
    >
      {product.image ? (
        <Image 
          source={{ uri: product.image }} 
          className="w-full h-32 rounded-lg mb-2"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 rounded-lg mb-2 bg-gray-200 items-center justify-center">
          <Text className="text-gray-400">🍔</Text>
        </View>
      )}
      
      <Text className="font-semibold text-[#1a1a1a] mb-1" numberOfLines={2}>
        {product.name}
      </Text>
      
      <Text className="text-[#C62828] font-bold text-lg">
        {product.price?.toFixed(2)}€
      </Text>
      
      {product.available === false && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded">
          <Text className="text-white text-xs font-semibold">Épuisé</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
