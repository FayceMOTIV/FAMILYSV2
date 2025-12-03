import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { fetchProducts } from '../../services/productsService';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

export default function CategoryProducts() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, [name]);
  
  const loadProducts = async () => {
    try {
      const category = name === 'all' ? null : decodeURIComponent(name);
const products = await fetchProducts(category);
setProducts(products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const categoryName = name === 'all' ? 'Tous les produits' : decodeURIComponent(name);
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <View className="flex-1 bg-[#f5f5f5]">
      {/* Header */}
      <View className="bg-[#C62828] px-6 pt-12 pb-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-3xl font-bold">
          {categoryName}
        </Text>
        <Text className="text-white text-base opacity-90 mt-1">
          {products.length} produit(s)
        </Text>
      </View>
      
      {/* Products Grid */}
      {products.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">📦</Text>
          <Text className="text-2xl font-bold text-[#1a1a1a] mb-2">
            Aucun produit
          </Text>
          <Text className="text-[#666666] text-center">
            Aucun produit disponible dans cette catégorie
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="w-[48%] mb-4">
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
