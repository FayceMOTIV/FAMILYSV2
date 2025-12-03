import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import OptionCard from '../../components/OptionCard';
import SupplementControl from '../../components/SupplementControl';
import { fetchProductById } from '../../services/productsService';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  
  const [selectedOptions, setSelectedOptions] = useState({});
  const [supplementQuantities, setSupplementQuantities] = useState({});

  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProduct();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data);
        const initialOptions = {};
        data.option_groups?.forEach(group => {
          if (group.type === 'single' && group.options.length > 0) {
            initialOptions[group.id] = group.options[0].id;
          }
        });
        setSelectedOptions(initialOptions);
      } else {
        Alert.alert('Erreur', 'Produit introuvable');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erreur', "Impossible de charger le produit");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getBasePrice = () => product?.promo_price || product?.base_price || product?.price || 0;
  const getOriginalPrice = () => product?.base_price || product?.price || 0;
  const hasPromo = () => product?.promo_price && product.promo_price < product.base_price;
  const getDiscountPercent = () => hasPromo() ? Math.round((1 - product.promo_price / product.base_price) * 100) : 0;

  const calculatePrice = () => {
    if (!product) return 0;
    let total = getBasePrice();
    
    product.option_groups?.forEach(group => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) total += option.delta_price;
      } else if (group.type === 'multi') {
        group.options.forEach(option => {
          if (selectedOptions[group.id]?.includes(option.id)) {
            const qty = supplementQuantities[option.id] || 1;
            total += option.delta_price * qty;
          }
        });
      }
    });
    return total;
  };

  const handleOptionSelect = (groupId, optionId) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
  };

  const handleSupplementChange = (optionId, delta) => {
    setSupplementQuantities(prev => ({
      ...prev,
      [optionId]: Math.max(0, (prev[optionId] || 0) + delta)
    }));
  };

  const shouldShowGroup = (group) => {
    if (!group.show_if) return true;
    return Object.entries(group.show_if).every(([key, value]) => selectedOptions[key] === value);
  };

  const handleAddToCart = () => {
    const missingRequired = product.option_groups?.filter(group => 
      group.required && shouldShowGroup(group) && !selectedOptions[group.id]
    );
    
    if (missingRequired?.length > 0) {
      Alert.alert('Option obligatoire', `Veuillez sélectionner : ${missingRequired.map(g => g.name).join(', ')}`);
      return;
    }

    const options = [];
    product.option_groups?.forEach(group => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) options.push(option.delta_price ? `${option.name} (+${option.delta_price.toFixed(2)}€)` : option.name);
      } else if (group.type === 'multi' && selectedOptions[group.id]) {
        selectedOptions[group.id].forEach(optId => {
          const option = group.options.find(o => o.id === optId);
          const qty = supplementQuantities[optId] || 1;
          if (option && qty > 0) options.push(`${qty}x ${option.name} (+${(option.delta_price * qty).toFixed(2)}€)`);
        });
      }
    });

    addItem({
      id: product.id,
      name: product.name,
      price: calculatePrice(),
      base_price: product.base_price,
      promo_price: product.promo_price,
      promo_badge: product.promo_badge,
      image_url: product.image_url,
      emoji: product.emoji,
      quantity,
      options,
      selectedOptions,
      supplementQuantities,
    });

    Alert.alert('✅ Ajouté', `${quantity}x ${product.name}${hasPromo() ? '\n🎉 Promo appliquée !' : ''}`, [
      { text: 'Continuer', onPress: () => router.back() },
      { text: 'Voir panier', onPress: () => router.push('/(tabs)/cart') }
    ]);
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🍽️</Text>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const hasImage = product.image_url && !imageError;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, hasPromo() && styles.headerPromo]}>
        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, isFavorite(product.id) && styles.navBtnFav]}
            onPress={() => toggleFavorite(product.id)}
          >
            <Text style={styles.navBtnText}>{isFavorite(product.id) ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Image ou Emoji */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Animated.Text style={[styles.productEmoji, { transform: [{ scale: scaleValue }] }]}>
              {product.emoji || '🍔'}
            </Animated.Text>
          )}
        </View>

        {/* Badge promo - TOUJOURS VISIBLE en haut à droite */}
        {hasPromo() && (
          <Animated.View style={[
            styles.promoBadge,
            { backgroundColor: product.promo_badge_color || '#EF4444', transform: [{ scale: pulseValue }] }
          ]}>
            <Text style={styles.promoBadgeText}>{product.promo_badge || `🔥 -${getDiscountPercent()}%`}</Text>
          </Animated.View>
        )}

        {/* Ruban promo */}
        {hasPromo() && (
          <View style={styles.promoRibbon}>
            <Text style={styles.promoRibbonText}>OFFRE SPÉCIALE</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info produit */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          {/* Prix */}
          <View style={styles.priceSection}>
            {hasPromo() ? (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.promoPrice}>{getBasePrice().toFixed(2)}€</Text>
                  <Text style={styles.originalPrice}>{getOriginalPrice().toFixed(2)}€</Text>
                  <View style={[styles.discountTag, { backgroundColor: product.promo_badge_color || '#EF4444' }]}>
                    <Text style={styles.discountTagText}>-{getDiscountPercent()}%</Text>
                  </View>
                </View>
                <View style={styles.savingsBox}>
                  <Text style={styles.savingsText}>🎉 Économisez {(getOriginalPrice() - getBasePrice()).toFixed(2)}€</Text>
                </View>
              </>
            ) : (
              <Text style={styles.normalPrice}>{getBasePrice().toFixed(2)}€</Text>
            )}
          </View>
        </View>

        {/* Options */}
        {product.option_groups?.map(group => {
          if (!shouldShowGroup(group)) return null;
          return (
            <View key={group.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{group.name}</Text>
                {group.required && <View style={styles.requiredTag}><Text style={styles.requiredText}>Obligatoire</Text></View>}
              </View>
              {group.type === 'single' && group.options.map(option => (
                <OptionCard key={option.id} option={option} isSelected={selectedOptions[group.id] === option.id} onPress={() => handleOptionSelect(group.id, option.id)} />
              ))}
              {group.type === 'multi' && group.options.map(option => (
                <SupplementControl key={option.id} supplement={option} quantity={supplementQuantities[option.id] || 0} onIncrease={() => handleSupplementChange(option.id, 1)} onDecrease={() => handleSupplementChange(option.id, -1)} />
              ))}
            </View>
          );
        })}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.quantityBox}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.addBtn, hasPromo() && styles.addBtnPromo]} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>Ajouter</Text>
          <View style={styles.addBtnPrice}>
            <Text style={styles.addBtnPriceText}>{(calculatePrice() * quantity).toFixed(2)}€</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  // Header
  header: { height: 300, backgroundColor: '#1a1a1a', position: 'relative', overflow: 'hidden' },
  headerPromo: { backgroundColor: '#1a1a1a' },
  
  navRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60,
    zIndex: 10,
  },
  navBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  navBtnFav: { backgroundColor: '#FEF3C7' },
  navBtnText: { fontSize: 24, color: '#FFF' },
  
  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  productImage: { 
    width: '100%', height: '100%', borderRadius: 0,
    backgroundColor: '#FFF',
  },
  productEmoji: { fontSize: 120 },
  
  // Badge promo - Position fixe en haut à droite
  promoBadge: {
    position: 'absolute',
    top: 115,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 20,
  },
  promoBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  promoRibbon: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    alignItems: 'center',
  },
  promoRibbonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  
  // Content
  content: { flex: 1 },
  infoSection: { backgroundColor: '#FFF', padding: 24 },
  productTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  productDescription: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 20 },
  
  priceSection: { marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoPrice: { fontSize: 32, fontWeight: 'bold', color: '#DC2626' },
  originalPrice: { fontSize: 18, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  discountTagText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  normalPrice: { fontSize: 32, fontWeight: 'bold', color: '#4F46E5' },
  
  savingsBox: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  savingsText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
  
  section: { backgroundColor: '#FFF', padding: 24, marginTop: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  requiredTag: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  requiredText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  
  // Footer
  footer: { 
    flexDirection: 'row', backgroundColor: '#FFF', 
    padding: 16, paddingBottom: 36, gap: 12,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
  },
  quantityBox: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 4 
  },
  qtyBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 26, fontWeight: 'bold', color: '#4F46E5' },
  qtyValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', minWidth: 32, textAlign: 'center' },
  
  addBtn: { 
    flex: 1, backgroundColor: '#4F46E5', borderRadius: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  addBtnPromo: { backgroundColor: '#DC2626' },
  addBtnText: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  addBtnPrice: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  addBtnPriceText: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingEmoji: { fontSize: 60, marginBottom: 16 },
  loadingText: { fontSize: 16, color: '#6B7280' },
});
