import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../stores/cartStore';

// Badges statiques (pour produits sans promo)
const BADGE_CONFIG = {
  promo: { bg: '#EF4444', text: '🏷️ PROMO' },
  bestseller: { bg: '#F59E0B', text: '⭐ BEST-SELLER' },
  nouveau: { bg: '#10B981', text: '✨ NOUVEAU' },
  cashback_booste: { bg: '#8B5CF6', text: '💰 CASHBACK+' }
};

export default function ProductCard({ product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Image depuis le backend ou placeholder
  const imageUri = product.image_url || product.image || `https://via.placeholder.com/400x300/C62828/FFFFFF?text=${encodeURIComponent(product.name || 'Produit')}`;
  
  // Badge dynamique depuis promo OU badge statique
  const hasPromo = product.promo_price && product.promo_price < product.base_price;
  const promoBadge = hasPromo ? {
    bg: product.promo_badge_color || '#EF4444',
    text: product.promo_badge || '🏷️ PROMO'
  } : null;
  
  // Fallback sur badge statique si pas de promo
  const staticBadge = BADGE_CONFIG[product.badge];
  const displayBadge = promoBadge || staticBadge;

  // Prix à afficher
  const originalPrice = product.base_price || product.price || 0;
  const finalPrice = hasPromo ? product.promo_price : originalPrice;

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="relative">
        <Image 
          source={{ uri: imageUri }}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {/* Badge dynamique (promo ou statique) */}
        {displayBadge && (
          <View 
            className="absolute top-2 left-2 px-3 py-1 rounded-lg"
            style={{ backgroundColor: displayBadge.bg }}
          >
            <Text className="text-white text-xs font-bold">{displayBadge.text}</Text>
          </View>
        )}
        
        {/* Badge rupture de stock */}
        {product.is_out_of_stock && (
          <View className="absolute top-2 right-2 bg-red-500 px-3 py-1 rounded-lg">
            <Text className="text-white text-xs font-bold">RUPTURE</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View className="p-4">
        {/* Nom */}
        <Text className="text-lg font-bold text-text mb-1" numberOfLines={2}>
          {product.name}
        </Text>

        {/* Description */}
        {product.description && (
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {/* Prix et Action */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            {/* Prix promo */}
            <Text className="text-xl font-bold text-primary">
              {finalPrice.toFixed(2)}€
            </Text>
            
            {/* Prix barré si promo */}
            {hasPromo && (
              <Text className="text-sm text-gray-400 line-through ml-2">
                {originalPrice.toFixed(2)}€
              </Text>
            )}
          </View>

          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            disabled={product.is_out_of_stock}
            style={{ opacity: product.is_out_of_stock ? 0.5 : 1 }}
          >
            <Text className="text-white font-bold">
              {product.is_out_of_stock ? 'Indispo' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
