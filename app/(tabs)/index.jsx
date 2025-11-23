import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { getProducts, getCategories, getFeaturedProducts, getPromos } from '../../services/products';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import Card from '../../components/Card';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../../components/SkeletonLoader';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      const [categoriesRes, featuredRes, promosRes] = await Promise.all([
        getCategories(),
        getFeaturedProducts(10),
        getPromos()
      ]);
      
      setCategories(categoriesRes.categories || []);
      setFeaturedProducts(featuredRes.products || []);
      setPromos(promosRes.promos || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <ScrollView 
      className="flex-1 bg-[#f5f5f5]"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-[#C62828] px-6 pt-12 pb-6">
        <Text className="text-white text-3xl font-bold mb-2">
          Bonjour {user?.name?.split(' ')[0] || 'Client'} 👋
        </Text>
        <Text className="text-white text-base opacity-90">
          Que voulez-vous manger aujourd'hui ?
        </Text>
      </View>
      
      {/* Promotions */}
      {promos.length > 0 && (
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-[#1a1a1a] mb-3">
            Promotions 🎉
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promos.map((promo) => (
              <Card key={promo.id} className="w-72 mr-3 bg-gradient-to-r from-[#C62828] to-[#8B1C1C]">
                <Text className="text-white font-bold text-lg mb-1">
                  {promo.name}
                </Text>
                <Text className="text-white opacity-90 text-sm">
                  {promo.description}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Categories */}
      <View className="px-6 py-4">
        <Text className="text-xl font-bold text-[#1a1a1a] mb-3">
          Catégories
        </Text>
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </ScrollView>
        ) : categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, idx) => (
              <CategoryCard key={`${cat.name}-${idx}`} category={cat} />
            ))}
          </ScrollView>
        ) : (
          <Text className="text-[#666666] text-center py-4">
            Aucune catégorie disponible
          </Text>
        )}
      </View>
      
      {/* Featured Products */}
      <View className="px-6 py-4 pb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-[#1a1a1a]">
            Recommandés pour vous
          </Text>
          <TouchableOpacity onPress={() => router.push('/category/all')}>
            <Text className="text-[#C62828] font-semibold">Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </ScrollView>
        ) : featuredProducts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        ) : (
          <Card>
            <Text className="text-[#666666] text-center py-8">
              Aucun produit disponible pour le moment.
              {"\n"}Revenez plus tard !
            </Text>
          </Card>
        )}
      </View>
      
      {/* Surprise du Jour CTA */}
      <View className="px-6 pb-8">
        <TouchableOpacity 
          onPress={() => router.push('/surprise')}
          activeOpacity={0.8}
        >
          <Card className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] p-6">
            <Text className="text-2xl font-bold text-[#1a1a1a] mb-2">
              🎁 Surprise du Jour
            </Text>
            <Text className="text-[#333333] text-base">
              Tentez votre chance et gagnez des récompenses exclusives !
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
