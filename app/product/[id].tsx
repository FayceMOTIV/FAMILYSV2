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
import { API_BASE_URL } from '../../constants/config';

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
  const hasBadge = () => !!product?.promo_badge;
  const getDiscountPercent = () => hasPromo() ? Math.round((1 - product.promo_price / product.base_price) * 100) : 0;

  // Calculer le prix total avec toutes les options imbriquées
  const calculatePrice = () => {
    if (!product) return 0;
    let total = getBasePrice();
    
    // Fonction récursive pour calculer le prix des sous-options
    const addSubOptionPrices = (subOptions, parentKey) => {
      let subTotal = 0;
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (subOption.type === 'single' && selectedOptions[subKey]) {
          const subChoice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (subChoice) {
            subTotal += subChoice.price || 0;
            // Récursion pour les sous-sous-options
            if (subChoice.sub_options?.length > 0) {
              subTotal += addSubOptionPrices(subChoice.sub_options, `${subKey}_${subChoice.id}`);
            }
          }
        }
      });
      return subTotal;
    };
    
    product.option_groups?.forEach(group => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) {
          total += option.delta_price || 0;
          
          // Ajouter le prix des sous-options (récursif)
          if (option.sub_options?.length > 0) {
            total += addSubOptionPrices(option.sub_options, `${group.id}_${option.id}`);
          }
        }
      } else if (group.type === 'multi') {
        group.options.forEach(option => {
          if (selectedOptions[group.id]?.includes(option.id)) {
            const qty = supplementQuantities[option.id] || 1;
            total += (option.delta_price || 0) * qty;
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
    if (group.depends_on_option_id && group.depends_on_choice_id) {
      return selectedOptions[group.depends_on_option_id] === group.depends_on_choice_id;
    }
    if (group.show_if) {
      return Object.entries(group.show_if).every(([key, value]) => selectedOptions[key] === value);
    }
    return true;
  };

  // Vérifier les options obligatoires de manière récursive
  const getMissingRequiredOptions = () => {
    const missing = [];
    
    const checkSubOptions = (subOptions, parentKey, selectedChoice) => {
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (subOption.is_required && !selectedOptions[subKey]) {
          missing.push(subOption.name);
        } else if (selectedOptions[subKey]) {
          const choice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (choice?.sub_options?.length > 0) {
            checkSubOptions(choice.sub_options, `${subKey}_${choice.id}`, choice);
          }
        }
      });
    };
    
    product?.option_groups?.forEach(group => {
      if (group.required && shouldShowGroup(group) && !selectedOptions[group.id]) {
        missing.push(group.name);
      } else if (group.type === 'single' && selectedOptions[group.id]) {
        const selectedChoice = group.options.find(o => o.id === selectedOptions[group.id]);
        if (selectedChoice?.sub_options?.length > 0) {
          checkSubOptions(selectedChoice.sub_options, `${group.id}_${selectedChoice.id}`, selectedChoice);
        }
      }
    });
    
    return missing;
  };

  // Collecter toutes les options sélectionnées pour l'affichage dans le panier
  const collectSelectedOptionsText = () => {
    const options = [];
    
    const collectSubOptions = (subOptions, parentKey) => {
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (selectedOptions[subKey]) {
          const choice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (choice) {
            const priceText = choice.price > 0 ? ` (+${choice.price.toFixed(2)}€)` : '';
            options.push(`${choice.name}${priceText}`);
            if (choice.sub_options?.length > 0) {
              collectSubOptions(choice.sub_options, `${subKey}_${choice.id}`);
            }
          }
        }
      });
    };
    
    product?.option_groups?.forEach(group => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) {
          const priceText = option.delta_price > 0 ? ` (+${option.delta_price.toFixed(2)}€)` : '';
          options.push(`${option.name}${priceText}`);
          if (option.sub_options?.length > 0) {
            collectSubOptions(option.sub_options, `${group.id}_${option.id}`);
          }
        }
      } else if (group.type === 'multi' && selectedOptions[group.id]) {
        selectedOptions[group.id].forEach(optId => {
          const option = group.options.find(o => o.id === optId);
          const qty = supplementQuantities[optId] || 1;
          if (option && qty > 0) {
            options.push(`${qty}x ${option.name} (+${(option.delta_price * qty).toFixed(2)}€)`);
          }
        });
      }
    });
    
    return options;
  };

  const handleAddToCart = () => {
    const missingRequired = getMissingRequiredOptions();
    
    if (missingRequired.length > 0) {
      Alert.alert('Option obligatoire', `Veuillez sélectionner : ${missingRequired.join(', ')}`);
      return;
    }

    const options = collectSelectedOptionsText();

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

    Alert.alert('✅ Ajouté', `${quantity}x ${product.name}${(hasBadge() || hasPromo()) ? '\n🎉 Promo appliquée !' : ''}`, [
      { text: 'Continuer', onPress: () => router.back() },
      { text: 'Voir panier', onPress: () => router.push('/(tabs)/cart') }
    ]);
  };

  // Rendu récursif des sous-options
  const renderSubOptions = (subOptions, parentKey, depth = 1) => {
    if (!subOptions || subOptions.length === 0) return null;
    
    return subOptions.map(subOption => {
      const subKey = `${parentKey}_${subOption.id}`;
      const selectedChoiceId = selectedOptions[subKey];
      const selectedChoice = selectedChoiceId 
        ? subOption.choices?.find(c => c.id === selectedChoiceId) 
        : null;
      
      // Vérifier si des choix ont des images
      const hasImages = subOption.choices?.some(c => c.image_url);
      
      return (
        <View key={subOption.id}>
          <View style={[styles.section, styles.subOptionSection, { marginLeft: 12 * depth }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.depthIndicator, { backgroundColor: getDepthColor(depth) }]} />
                <Text style={styles.sectionTitle}>{subOption.name}</Text>
              </View>
              {subOption.is_required && (
                <View style={styles.requiredTag}>
                  <Text style={styles.requiredText}>Obligatoire</Text>
                </View>
              )}
            </View>
            
            {/* Affichage en grille si images, sinon liste */}
            {hasImages ? (
              <View style={styles.choicesGrid}>
                {subOption.choices?.map(choice => (
                  <OptionCard
                    key={choice.id}
                    option={{ ...choice, delta_price: choice.price }}
                    isSelected={selectedOptions[subKey] === choice.id}
                    onPress={() => handleOptionSelect(subKey, choice.id)}
                  />
                ))}
              </View>
            ) : (
              subOption.choices?.map(choice => (
                <OptionCard
                  key={choice.id}
                  option={{ ...choice, delta_price: choice.price }}
                  isSelected={selectedOptions[subKey] === choice.id}
                  onPress={() => handleOptionSelect(subKey, choice.id)}
                  compact={depth > 1}
                />
              ))
            )}
          </View>
          
          {/* Sous-options du choix sélectionné (récursif) */}
          {selectedChoice?.sub_options?.length > 0 && 
            renderSubOptions(selectedChoice.sub_options, `${subKey}_${selectedChoice.id}`, depth + 1)
          }
        </View>
      );
    });
  };

  // Couleur selon la profondeur
  const getDepthColor = (depth) => {
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    return colors[(depth - 1) % colors.length];
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
      {/* Header compact */}
      <View style={[styles.header, (hasBadge() || hasPromo()) && styles.headerPromo]}>
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

        {(hasBadge() || hasPromo()) && (
          <Animated.View style={[
            styles.promoBadge,
            { backgroundColor: product.promo_badge_color || '#EF4444', transform: [{ scale: pulseValue }] }
          ]}>
            <Text style={styles.promoBadgeText}>{product.promo_badge || `🔥 -${getDiscountPercent()}%`}</Text>
          </Animated.View>
        )}

        {(hasBadge() || hasPromo()) && (
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
          
          const selectedChoice = group.type === 'single' && selectedOptions[group.id]
            ? group.options.find(o => o.id === selectedOptions[group.id])
            : null;
          
          // Vérifier si des choix ont des images
          const hasImages = group.options?.some(o => o.image_url);
          
          return (
            <View key={group.id}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{group.name}</Text>
                  {group.required && (
                    <View style={styles.requiredTag}>
                      <Text style={styles.requiredText}>Obligatoire</Text>
                    </View>
                  )}
                </View>
                
                {/* Affichage en grille si images, sinon liste */}
                {group.type === 'single' && hasImages ? (
                  <View style={styles.choicesGrid}>
                    {group.options.map(option => (
                      <OptionCard
                        key={option.id}
                        option={option}
                        isSelected={selectedOptions[group.id] === option.id}
                        onPress={() => handleOptionSelect(group.id, option.id)}
                      />
                    ))}
                  </View>
                ) : group.type === 'single' ? (
                  group.options.map(option => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={selectedOptions[group.id] === option.id}
                      onPress={() => handleOptionSelect(group.id, option.id)}
                    />
                  ))
                ) : (
                  group.options.map(option => (
                    <SupplementControl
                      key={option.id}
                      supplement={option}
                      quantity={supplementQuantities[option.id] || 0}
                      onIncrease={() => handleSupplementChange(option.id, 1)}
                      onDecrease={() => handleSupplementChange(option.id, -1)}
                    />
                  ))
                )}
              </View>
              
              {/* Sous-options du choix sélectionné (récursif) */}
              {selectedChoice?.sub_options?.length > 0 && 
                renderSubOptions(selectedChoice.sub_options, `${group.id}_${selectedChoice.id}`, 1)
              }
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
        
        <TouchableOpacity style={[styles.addBtn, (hasBadge() || hasPromo()) && styles.addBtnPromo]} onPress={handleAddToCart}>
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
  
  // Header - Plus compact
  header: { height: 250, backgroundColor: '#1a1a1a', position: 'relative', overflow: 'hidden' },
  headerPromo: { backgroundColor: '#1a1a1a' },
  
  navRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 50,
    zIndex: 10,
  },
  navBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  navBtnFav: { backgroundColor: '#FEF3C7' },
  navBtnText: { fontSize: 22, color: '#FFF' },
  
  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  productImage: { width: '100%', height: '100%', backgroundColor: '#FFF' },
  productEmoji: { fontSize: 100 },
  
  promoBadge: {
    position: 'absolute',
    top: 100,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 20,
  },
  promoBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  promoRibbon: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    alignItems: 'center',
  },
  promoRibbonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, letterSpacing: 2 },
  
  // Content
  content: { flex: 1 },
  infoSection: { backgroundColor: '#FFF', padding: 20 },
  productTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  productDescription: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 16 },
  
  priceSection: { marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promoPrice: { fontSize: 28, fontWeight: 'bold', color: '#DC2626' },
  originalPrice: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountTagText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  normalPrice: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5' },
  
  savingsBox: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, marginTop: 12,
    borderWidth: 1, borderColor: '#FECACA',
  },
  savingsText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
  
  // Sections options - Plus compactes
  section: { backgroundColor: '#FFF', padding: 16, marginTop: 8 },
  subOptionSection: { 
    backgroundColor: '#FAFAFA', 
    borderLeftWidth: 3, 
    borderLeftColor: '#8B5CF6',
    marginRight: 0,
    paddingVertical: 12,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  depthIndicator: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  requiredTag: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  requiredText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  
  // Grille pour les choix avec images
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Footer
  footer: { 
    flexDirection: 'row', backgroundColor: '#FFF', 
    padding: 14, paddingBottom: 32, gap: 10,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
  },
  quantityBox: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 4 
  },
  qtyBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5' },
  qtyValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', minWidth: 28, textAlign: 'center' },
  
  addBtn: { 
    flex: 1, backgroundColor: '#4F46E5', borderRadius: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
  },
  addBtnPromo: { backgroundColor: '#DC2626' },
  addBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  addBtnPrice: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  addBtnPriceText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingEmoji: { fontSize: 60, marginBottom: 16 },
  loadingText: { fontSize: 16, color: '#6B7280' },
});
