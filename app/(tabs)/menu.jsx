import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../../stores/cartStore';

const { width } = Dimensions.get('window');

// Services
import { API_BASE_URL } from '../../constants/config';

const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  const data = await response.json();
  return data.categories || [];
};

const fetchProducts = async (category = null, search = null) => {
  let url = `${API_BASE_URL}/products?`;
  if (category && category !== 'Tout') url += `category=${category}&`;
  if (search) url += `search=${search}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data.products || [];
};

// Composant ProductCard avec images et support promos
const ProductCard = ({ product, onPress, onAdd }) => {
  const router = useRouter();
  
  // Image du produit
  const imageUrl = product.image_url || product.image;
  const hasImage = imageUrl && imageUrl.length > 0;

  // Emoji fallback
  const getEmojiFromCategory = (category) => {
    const emojis = {
      'Burgers': '🍔',
      'Pizzas': '🍕',
      'Tacos': '🌮',
      'Desserts': '🍰',
      'Boissons': '🥤',
      'Kebabs': '🥙',
      'Salades': '🥗',
    };
    return emojis[category] || '🍽️';
  };

  // Calcul prix promo depuis active_promotions ou promo_price
  const hasPromo = (product.active_promotions && product.active_promotions.length > 0) || 
                   (product.promo_price && product.promo_price < product.base_price);
  const displayPrice = product.promo_price || product.final_price || product.base_price || 0;
  const originalPrice = product.original_price || product.base_price || 0;

  // Badge à afficher (depuis active_promotions ou badge statique)
  const getBadge = () => {
    // Promo dynamique
    if (product.active_promotions && product.active_promotions.length > 0) {
      const promo = product.active_promotions[0];
      return { 
        text: promo.badge_text || `-${promo.discount_value}%`, 
        color: promo.badge_color || '#EF4444' 
      };
    }
    // Legacy promo_badge
    if (hasPromo && product.promo_badge) {
      return { text: product.promo_badge, color: product.promo_badge_color || '#EF4444' };
    }
    // Badge statique
    if (product.badge === 'nouveau') return { text: 'NOUVEAU', color: '#EF4444' };
    if (product.badge === 'promo') return { text: 'PROMO', color: '#EF4444' };
    if (product.badge === 'bestseller') return { text: 'TOP', color: '#F59E0B' };
    return null;
  };

  const badge = getBadge();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.productImage}>
        {hasImage ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.productImageReal}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.productEmoji}>
            {getEmojiFromCategory(product.category || product.category_name)}
          </Text>
        )}
        
        {badge && (
          <View style={[styles.productBadge, { backgroundColor: badge.color }]}>
            <Text style={styles.productBadgeText}>{badge.text}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, hasPromo && styles.promoPrice]}>
              {displayPrice.toFixed(2)} €
            </Text>
            {hasPromo && displayPrice < originalPrice && (
              <Text style={styles.originalPrice}>
                {originalPrice.toFixed(2)} €
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MenuScreen() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const getTotal = useCartStore((state) => state.getTotal);
  
  const totalAmount = getTotal();
  const cartItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory === 'Tout' ? null : selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        loadProducts(
          selectedCategory === 'Tout' ? null : selectedCategory,
          searchQuery
        );
      } else if (searchQuery.length === 0) {
        loadProducts(selectedCategory === 'Tout' ? null : selectedCategory);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
      
      const allCategories = [
        { name: 'Tout', icon: '🍽️' },
        ...categoriesData
      ];
      
      setCategories(allCategories);
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le menu');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (category = null, search = null) => {
    try {
      const data = await fetchProducts(category, search);
      console.log('Produits chargés:', data.length, 'pour catégorie:', category);
      setProducts(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // IMPORTANT: Passer le produit complet avec promo_price
  const handleAddToCart = (product) => {
    const promo = product.active_promotions?.[0];
    addItem({
      id: product.id,
      name: product.name,
      base_price: product.base_price,
      price: product.promo_price || product.final_price || product.base_price,
      promo_price: product.promo_price,
      promo_badge: promo?.badge_text || product.promo_badge,
      image: product.image_url || product.image,
      image_url: product.image_url,
      description: product.description,
      category: product.category,
      quantity: 1,
    });
  };

  const groupedProducts = products.filter(p => p.category && p.category.trim() !== '').reduce((acc, product) => {
    const cat = product.category || product.category_name || 'Autres';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement du menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🍽️ Menu</Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.name && styles.categoryChipTextActive
                ]}
              >
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.productsContainer}>
        {selectedCategory === 'Tout' ? (
          Object.keys(groupedProducts).map((categoryName) => (
            <View key={categoryName}>
              <Text style={styles.sectionTitle}>{categoryName}</Text>
              <View style={styles.productsGrid}>
                {groupedProducts[categoryName].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAddToCart(product)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => handleAddToCart(product)}
              />
            ))}
          </View>
        )}
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {cartItemsCount > 0 && (
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCart}
        >
          <TouchableOpacity
            style={styles.floatingCartContent}
            onPress={() => router.push('/cart')}
          >
            <View style={styles.cartLeft}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
              <Text style={styles.cartText}>Voir mon panier</Text>
            </View>
            <Text style={styles.cartTotal}>{totalAmount.toFixed(2)} €</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  categoriesScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryChipActive: {
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryChipTextActive: {
    color: '#FF6B6B',
  },
  productsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productImageReal: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 60,
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  promoPrice: {
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 1000,
  },
  floatingCartContent: {
    padding: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartBadgeText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
