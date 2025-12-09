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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { fetchProductById } from '../../services/productsService';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = 90;

// ============================================
// TYPES
// ============================================
interface Choice {
  id: string;
  name: string;
  emoji?: string;
  image_url?: string;
  price?: number;
  delta_price?: number;
  sub_options?: SubOption[];
}

interface SubOption {
  id: string;
  name: string;
  type?: string;
  is_required?: boolean;
  choices?: Choice[];
}

interface OptionGroup {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  is_required?: boolean;
  options: Choice[];
  depends_on_option_id?: string;
  depends_on_choice_id?: string;
  show_if?: Record<string, string>;
}

// ============================================
// EMOJI FALLBACKS PAR CATÉGORIE
// ============================================
const EMOJI_FALLBACKS: Record<string, string> = {
  // Boissons
  'coca': '🥤', 'cola': '🥤', 'pepsi': '🥤', 'soda': '🥤',
  'fanta': '🍊', 'orange': '🍊', 'orangina': '🍊',
  'sprite': '🍋', 'citron': '🍋', 'lemon': '🍋',
  'ice tea': '🍑', 'thé': '🍵', 'tea': '🍵',
  'eau': '💧', 'water': '💧', 'perrier': '💧', 'evian': '💧',
  'jus': '🧃', 'juice': '🧃',
  'café': '☕', 'coffee': '☕',
  'milkshake': '🥛', 'lait': '🥛',
  
  // Accompagnements
  'frite': '🍟', 'frites': '🍟', 'fries': '🍟',
  'potato': '🥔', 'potatoes': '🥔', 'pomme': '🥔',
  'salade': '🥗', 'salad': '🥗',
  'onion': '🧅', 'oignon': '🧅',
  'nugget': '🍗', 'poulet': '🍗', 'chicken': '🍗',
  'cheese': '🧀', 'fromage': '🧀',
  'bacon': '🥓',
  'oeuf': '🍳', 'egg': '🍳',
  
  // Sauces
  'ketchup': '🍅', 'tomate': '🍅',
  'mayo': '🥚', 'mayonnaise': '🥚',
  'bbq': '🔥', 'barbecue': '🔥',
  'moutarde': '🌭', 'mustard': '🌭',
  'piment': '🌶️', 'spicy': '🌶️', 'algérien': '🌶️', 'samurai': '⚔️', 'samourai': '⚔️',
  'andalou': '🇪🇸',
  'biggy': '⭐', 'special': '⭐', 'maison': '⭐',
  
  // Burgers
  'burger': '🍔', 'hamburger': '🍔',
  'smash': '🍔', 'double': '🍔',
  
  // Tacos
  'taco': '🌮', 'tacos': '🌮',
  'wrap': '🌯', 'burrito': '🌯',
  
  // Format
  'menu': '🍔🍟🥤', 'formule': '🍔🍟🥤',
  'seul': '🍔', 'simple': '🍔',
  'xl': '📦', 'large': '📦', 'grand': '📦',
  
  // Default
  'default': '🍽️',
};

const getEmojiForItem = (name: string, providedEmoji?: string): string => {
  if (providedEmoji) return providedEmoji;
  
  const lowerName = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_FALLBACKS)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  return EMOJI_FALLBACKS.default;
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  
  // State
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ============================================
  // LOAD PRODUCT
  // ============================================
  useEffect(() => {
    loadProduct();
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await fetchProductById(id as string);
      if (data) {
        setProduct(data);
      } else {
        Alert.alert('Erreur', 'Produit introuvable');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PRICE & OPTIONS HELPERS
  // ============================================
  const getBasePrice = () => product?.promo_price || product?.base_price || product?.price || 0;
  const getOriginalPrice = () => product?.base_price || product?.price || 0;
  const hasPromo = () => product?.promo_price && product.promo_price < product.base_price;
  const getDiscountPercent = () => hasPromo() ? Math.round((1 - product.promo_price / product.base_price) * 100) : 0;

  // Calcul prix total récursif
  const calculatePrice = (): number => {
    if (!product) return 0;
    let total = getBasePrice();
    
    const addSubOptionPrices = (subOptions: SubOption[], parentKey: string): number => {
      let subTotal = 0;
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (selectedOptions[subKey]) {
          const subChoice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (subChoice) {
            subTotal += subChoice.price || 0;
            if (subChoice.sub_options?.length) {
              subTotal += addSubOptionPrices(subChoice.sub_options, `${subKey}_${subChoice.id}`);
            }
          }
        }
      });
      return subTotal;
    };
    
    product.option_groups?.forEach((group: OptionGroup) => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) {
          total += option.delta_price || option.price || 0;
          if (option.sub_options?.length) {
            total += addSubOptionPrices(option.sub_options, `${group.id}_${option.id}`);
          }
        }
      }
    });
    
    return total;
  };

  // Vérifier si le groupe doit être affiché
  const shouldShowGroup = (group: OptionGroup): boolean => {
    if (group.depends_on_option_id && group.depends_on_choice_id) {
      return selectedOptions[group.depends_on_option_id] === group.depends_on_choice_id;
    }
    if (group.show_if) {
      return Object.entries(group.show_if).every(([key, value]) => selectedOptions[key] === value);
    }
    return true;
  };

  // Options manquantes
  const getMissingRequiredOptions = (): string[] => {
    const missing: string[] = [];
    
    const checkSubOptions = (subOptions: SubOption[], parentKey: string) => {
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (subOption.is_required && !selectedOptions[subKey]) {
          missing.push(subOption.name);
        } else if (selectedOptions[subKey]) {
          const choice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (choice?.sub_options?.length) {
            checkSubOptions(choice.sub_options, `${subKey}_${choice.id}`);
          }
        }
      });
    };
    
    product?.option_groups?.forEach((group: OptionGroup) => {
      if ((group.required || group.is_required) && shouldShowGroup(group) && !selectedOptions[group.id]) {
        missing.push(group.name);
      } else if (group.type === 'single' && selectedOptions[group.id]) {
        const selectedChoice = group.options.find(o => o.id === selectedOptions[group.id]);
        if (selectedChoice?.sub_options?.length) {
          checkSubOptions(selectedChoice.sub_options, `${group.id}_${selectedChoice.id}`);
        }
      }
    });
    
    return missing;
  };

  // Récap des sélections
  const buildRecap = (): { emoji: string; name: string; price?: number }[] => {
    const items: { emoji: string; name: string; price?: number }[] = [];
    
    const collectFromSubOptions = (subOptions: SubOption[], parentKey: string) => {
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (selectedOptions[subKey]) {
          const choice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (choice) {
            items.push({
              emoji: getEmojiForItem(choice.name, choice.emoji),
              name: choice.name,
              price: choice.price,
            });
            if (choice.sub_options?.length) {
              collectFromSubOptions(choice.sub_options, `${subKey}_${choice.id}`);
            }
          }
        }
      });
    };
    
    product?.option_groups?.forEach((group: OptionGroup) => {
      if (group.type === 'single' && selectedOptions[group.id] && shouldShowGroup(group)) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) {
          // Skip format "seul" from recap
          if (group.name.toLowerCase().includes('format') && option.name.toLowerCase() === 'seul') {
            return;
          }
          items.push({
            emoji: getEmojiForItem(option.name, option.emoji),
            name: option.name,
            price: option.delta_price || option.price,
          });
          if (option.sub_options?.length) {
            collectFromSubOptions(option.sub_options, `${group.id}_${option.id}`);
          }
        }
      }
    });
    
    return items;
  };

  // Collecter les options pour le panier
  const collectSelectedOptionsText = (): string[] => {
    const options: string[] = [];
    
    const collectSubOptions = (subOptions: SubOption[], parentKey: string) => {
      subOptions?.forEach(subOption => {
        const subKey = `${parentKey}_${subOption.id}`;
        if (selectedOptions[subKey]) {
          const choice = subOption.choices?.find(c => c.id === selectedOptions[subKey]);
          if (choice) {
            const priceText = choice.price && choice.price > 0 ? ` (+${choice.price.toFixed(2)}€)` : '';
            options.push(`${choice.name}${priceText}`);
            if (choice.sub_options?.length) {
              collectSubOptions(choice.sub_options, `${subKey}_${choice.id}`);
            }
          }
        }
      });
    };
    
    product?.option_groups?.forEach((group: OptionGroup) => {
      if (group.type === 'single' && selectedOptions[group.id]) {
        const option = group.options.find(o => o.id === selectedOptions[group.id]);
        if (option) {
          const price = option.delta_price || option.price || 0;
          const priceText = price > 0 ? ` (+${price.toFixed(2)}€)` : '';
          options.push(`${option.name}${priceText}`);
          if (option.sub_options?.length) {
            collectSubOptions(option.sub_options, `${group.id}_${option.id}`);
          }
        }
      }
    });
    
    return options;
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleOptionSelect = (groupId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
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
    });

    Alert.alert(
      '✅ Ajouté au panier',
      `${quantity}x ${product.name}${hasPromo() ? '\n🎉 Promo appliquée !' : ''}`,
      [
        { text: 'Continuer', onPress: () => router.back() },
        { text: 'Voir panier', onPress: () => router.push('/(tabs)/cart') }
      ]
    );
  };

  // ============================================
  // SUB-COMPONENTS
  // ============================================
  
  // Image avec fallback emoji
  const ItemVisual = ({ item, size = 'normal', selected = false }: { 
    item: Choice; 
    size?: 'small' | 'normal' | 'large';
    selected?: boolean;
  }) => {
    const itemKey = item.id;
    const hasError = imageErrors[itemKey];
    
    const sizes = {
      small: { container: 40, emoji: 24 },
      normal: { container: 56, emoji: 32 },
      large: { container: 80, emoji: 48 },
    };
    
    const s = sizes[size];
    
    if (item.image_url && !hasError) {
      return (
        <Image 
          source={{ uri: item.image_url }}
          style={[
            styles.itemImage,
            { width: s.container, height: s.container },
            selected && styles.itemImageSelected
          ]}
          onError={() => setImageErrors(prev => ({ ...prev, [itemKey]: true }))}
        />
      );
    }
    
    return (
      <View style={[styles.itemEmojiContainer, { width: s.container, height: s.container }]}>
        <Text style={{ fontSize: s.emoji }}>{getEmojiForItem(item.name, item.emoji)}</Text>
      </View>
    );
  };

  // Grille pour ≤4 choix
  const GridChoices = ({ 
    choices, 
    groupId, 
    accentColor 
  }: { 
    choices: Choice[]; 
    groupId: string; 
    accentColor: string;
  }) => {
    const count = choices.length;
    const numColumns = count === 3 ? 3 : 2;
    
    return (
      <View style={[styles.gridContainer, { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {choices.map((choice) => {
          const isSelected = selectedOptions[groupId] === choice.id;
          const price = choice.delta_price || choice.price || 0;
          
          return (
            <TouchableOpacity
              key={choice.id}
              style={[
                styles.gridItem,
                { width: `${100 / numColumns - 2}%` },
                isSelected && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => handleOptionSelect(groupId, choice.id)}
              activeOpacity={0.7}
            >
              <ItemVisual item={choice} selected={isSelected} />
              <Text style={[styles.gridItemName, isSelected && styles.gridItemNameSelected]}>
                {choice.name}
              </Text>
              {price > 0 && (
                <Text style={[styles.gridItemPrice, isSelected && styles.gridItemPriceSelected]}>
                  +{price.toFixed(2)}€
                </Text>
              )}
              {isSelected && <View style={[styles.checkmark, { backgroundColor: '#fff' }]}>
                <Text style={{ color: accentColor, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              </View>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Carousel horizontal pour >4 choix
  const HorizontalCarousel = ({ 
    choices, 
    groupId, 
    accentColor 
  }: { 
    choices: Choice[]; 
    groupId: string; 
    accentColor: string;
  }) => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_ITEM_WIDTH + 12}
      >
        {choices.map((choice) => {
          const isSelected = selectedOptions[groupId] === choice.id;
          const price = choice.delta_price || choice.price || 0;
          
          return (
            <TouchableOpacity
              key={choice.id}
              style={[
                styles.carouselItem,
                isSelected && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => handleOptionSelect(groupId, choice.id)}
              activeOpacity={0.7}
            >
              <ItemVisual item={choice} size="small" selected={isSelected} />
              <Text 
                style={[styles.carouselItemName, isSelected && styles.carouselItemNameSelected]}
                numberOfLines={1}
              >
                {choice.name}
              </Text>
              {price > 0 && (
                <Text style={[styles.carouselItemPrice, isSelected && styles.carouselItemPriceSelected]}>
                  +{price.toFixed(2)}€
                </Text>
              )}
              {isSelected && <View style={[styles.checkmarkSmall, { backgroundColor: '#fff' }]}>
                <Text style={{ color: accentColor, fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={styles.scrollHint}>← Glisser pour voir plus →</Text>
    </View>
  );

  // Section wrapper
  const OptionSection = ({ 
    group, 
    color 
  }: { 
    group: OptionGroup; 
    color: string;
  }) => {
    if (!shouldShowGroup(group)) return null;
    
    const count = group.options.length;
    const isRequired = group.required || group.is_required;
    const useCarousel = count > 4;
    
    return (
      <Animated.View style={[styles.section, { borderLeftColor: color, opacity: fadeAnim }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>{getEmojiForItem(group.name)}</Text>
            <Text style={styles.sectionTitle}>{group.name}</Text>
            {useCarousel && (
              <View style={[styles.countBadge, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.countBadgeText, { color }]}>{count} choix</Text>
              </View>
            )}
          </View>
          {isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obligatoire</Text>
            </View>
          )}
        </View>
        
        {useCarousel ? (
          <HorizontalCarousel choices={group.options} groupId={group.id} accentColor={color} />
        ) : (
          <GridChoices choices={group.options} groupId={group.id} accentColor={color} />
        )}
      </Animated.View>
    );
  };

  // Sous-options récursives
  const renderSubOptions = (subOptions: SubOption[], parentKey: string, depth: number = 1) => {
    if (!subOptions?.length) return null;
    
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const color = colors[depth % colors.length];
    
    return subOptions.map(subOption => {
      const subKey = `${parentKey}_${subOption.id}`;
      const selectedChoiceId = selectedOptions[subKey];
      const selectedChoice = selectedChoiceId 
        ? subOption.choices?.find(c => c.id === selectedChoiceId) 
        : null;
      
      const count = subOption.choices?.length || 0;
      const useCarousel = count > 4;
      
      return (
        <View key={subOption.id}>
          <Animated.View 
            style={[
              styles.section, 
              styles.subSection,
              { borderLeftColor: color, marginLeft: 12 * depth, opacity: fadeAnim }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.depthIndicator, { backgroundColor: color }]} />
                <Text style={styles.sectionTitle}>{subOption.name}</Text>
                {useCarousel && (
                  <View style={[styles.countBadge, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.countBadgeText, { color }]}>{count} choix</Text>
                  </View>
                )}
              </View>
              {subOption.is_required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Obligatoire</Text>
                </View>
              )}
            </View>
            
            {useCarousel ? (
              <HorizontalCarousel 
                choices={subOption.choices || []} 
                groupId={subKey} 
                accentColor={color} 
              />
            ) : (
              <GridChoices 
                choices={subOption.choices || []} 
                groupId={subKey} 
                accentColor={color} 
              />
            )}
          </Animated.View>
          
          {selectedChoice?.sub_options?.length && 
            renderSubOptions(selectedChoice.sub_options, `${subKey}_${selectedChoice.id}`, depth + 1)
          }
        </View>
      );
    });
  };

  // Récap des sélections
  const RecapSection = () => {
    const items = buildRecap();
    if (items.length === 0) return null;
    
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.recapContainer}
      >
        <Text style={styles.recapTitle}>📝 Ta sélection :</Text>
        <View style={styles.recapItems}>
          {items.map((item, index) => (
            <View key={index} style={styles.recapItem}>
              <Text style={styles.recapItemEmoji}>{item.emoji}</Text>
              <Text style={styles.recapItemName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    );
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  const totalPrice = calculatePrice() * quantity;
  const missingOptions = getMissingRequiredOptions();
  const isComplete = missingOptions.length === 0;
  const recap = buildRecap();
  const COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#0EA5E9', '#EC4899', '#10B981'];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, hasPromo() && styles.headerPromo]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.headerGradient}
        />
        
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

        <View style={styles.productVisualContainer}>
          {product.image_url && !imageError ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <Animated.Text style={[styles.productEmoji, { transform: [{ scale: scaleAnim }] }]}>
              {product.emoji || getEmojiForItem(product.name)}
            </Animated.Text>
          )}
        </View>

        {hasPromo() && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>{product.promo_badge || `🔥 -${getDiscountPercent()}%`}</Text>
          </View>
        )}

        {hasPromo() && (
          <View style={styles.promoRibbon}>
            <Text style={styles.promoRibbonText}>✨ OFFRE LIMITÉE ✨</Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Product Info */}
          <View style={styles.infoSection}>
            <Text style={styles.productTitle}>{product.name}</Text>
            {product.description && (
              <Text style={styles.productDescription}>{product.description}</Text>
            )}
            
            <View style={styles.priceSection}>
              {hasPromo() ? (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.promoPrice}>{getBasePrice().toFixed(2)}€</Text>
                    <Text style={styles.originalPrice}>{getOriginalPrice().toFixed(2)}€</Text>
                    <View style={styles.discountTag}>
                      <Text style={styles.discountTagText}>-{getDiscountPercent()}%</Text>
                    </View>
                  </View>
                  <View style={styles.savingsBox}>
                    <Text style={styles.savingsText}>
                      🎉 Tu économises {(getOriginalPrice() - getBasePrice()).toFixed(2)}€ !
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.normalPrice}>{getBasePrice().toFixed(2)}€</Text>
              )}
            </View>
          </View>

          {/* Options */}
          {product.option_groups?.map((group: OptionGroup, index: number) => {
            const selectedChoice = group.type === 'single' && selectedOptions[group.id]
              ? group.options.find(o => o.id === selectedOptions[group.id])
              : null;
            
            return (
              <View key={group.id}>
                <OptionSection group={group} color={COLORS[index % COLORS.length]} />
                
                {selectedChoice?.sub_options?.length && 
                  renderSubOptions(selectedChoice.sub_options, `${group.id}_${selectedChoice.id}`, 1)
                }
              </View>
            );
          })}

          {/* Recap */}
          {recap.length > 0 && <RecapSection />}
        </Animated.View>
        
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        {!isComplete && (
          <View style={styles.warningBar}>
            <Text style={styles.warningText}>
              ⚠️ Sélectionne : {missingOptions.join(', ')}
            </Text>
          </View>
        )}
        
        <View style={styles.footerInner}>
          <View style={styles.quantityBox}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.addBtn, 
              hasPromo() && styles.addBtnPromo,
              !isComplete && styles.addBtnDisabled
            ]} 
            onPress={handleAddToCart}
            disabled={!isComplete}
            activeOpacity={0.8}
          >
            <Text style={[styles.addBtnText, !isComplete && styles.addBtnTextDisabled]}>
              Ajouter au panier
            </Text>
            <View style={[styles.addBtnPrice, !isComplete && styles.addBtnPriceDisabled]}>
              <Text style={[styles.addBtnPriceText, !isComplete && styles.addBtnPriceTextDisabled]}>
                {totalPrice.toFixed(2)}€
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' 
  },
  
  // Loading
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#64748B' 
  },
  
  // Header
  header: { 
    height: 260, 
    backgroundColor: '#1E293B', 
    position: 'relative', 
    overflow: 'hidden' 
  },
  headerPromo: { 
    backgroundColor: '#1E293B' 
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 1,
  },
  navRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 56,
    zIndex: 10,
  },
  navBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  navBtnFav: { 
    backgroundColor: '#FEF3C7' 
  },
  navBtnText: { 
    fontSize: 22, 
    color: '#FFF' 
  },
  productVisualContainer: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    bottom: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  productImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 24,
    backgroundColor: '#FFF' 
  },
  productEmoji: { 
    fontSize: 100 
  },
  promoBadge: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  promoBadgeText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  promoRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  promoRibbonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 12, 
    letterSpacing: 2 
  },
  
  // Content
  content: { 
    flex: 1 
  },
  contentContainer: { 
    padding: 16,
    paddingTop: 20,
  },
  
  // Info Section
  infoSection: { 
    backgroundColor: '#FFF', 
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  productTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    marginBottom: 8 
  },
  productDescription: { 
    fontSize: 15, 
    color: '#64748B', 
    lineHeight: 22, 
    marginBottom: 16 
  },
  priceSection: { 
    marginTop: 4 
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  promoPrice: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#EF4444' 
  },
  originalPrice: { 
    fontSize: 18, 
    color: '#94A3B8', 
    textDecorationLine: 'line-through' 
  },
  discountTag: { 
    backgroundColor: '#EF4444',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  discountTagText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  normalPrice: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  savingsBox: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingsText: { 
    color: '#059669', 
    fontWeight: '600', 
    fontSize: 14 
  },
  
  // Sections
  section: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  subSection: {
    backgroundColor: '#FAFBFC',
    marginRight: 0,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  depthIndicator: { 
    width: 4, 
    height: 20, 
    borderRadius: 2,
  },
  sectionTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requiredBadge: { 
    backgroundColor: '#FEE2E2', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  requiredText: { 
    color: '#DC2626', 
    fontSize: 11, 
    fontWeight: '600' 
  },
  
  // Grid
  gridContainer: {
    gap: 12,
  },
  gridItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    marginHorizontal: '1%',
    position: 'relative',
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
  gridItemNameSelected: {
    color: '#FFF',
  },
  gridItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  gridItemPriceSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Carousel
  carouselContainer: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
  },
  carouselItemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
  carouselItemNameSelected: {
    color: '#FFF',
  },
  carouselItemPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  carouselItemPriceSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  scrollHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Item visuals
  itemImage: {
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemImageSelected: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  itemEmojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  
  // Checkmarks
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Recap
  recapContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  recapTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  recapItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recapItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recapItemEmoji: {
    fontSize: 14,
  },
  recapItemName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Footer
  footer: { 
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  warningBar: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  warningText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },
  quantityBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 16, 
    padding: 4,
  },
  qtyBtn: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  qtyBtnText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#6366F1' 
  },
  qtyValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    minWidth: 36, 
    textAlign: 'center' 
  },
  addBtn: { 
    flex: 1, 
    backgroundColor: '#6366F1', 
    borderRadius: 16,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnPromo: { 
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  addBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  addBtnText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  addBtnTextDisabled: {
    color: '#94A3B8',
  },
  addBtnPrice: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  addBtnPriceDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addBtnPriceText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  addBtnPriceTextDisabled: {
    color: '#94A3B8',
  },
});
