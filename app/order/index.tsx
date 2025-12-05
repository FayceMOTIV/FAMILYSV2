import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useAuthStore } from '../../stores/authStore';
import CategoryButton from '../../components/CategoryButton';
import { fetchProducts, fetchCategories, searchProducts } from '../../services/productsService';


export default function OrderScreen() {
  const router = useRouter();
  const { items, getTotal, getItemCount } = useCartStore();
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchQuery]);

  const checkAuthAndLoad = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        '🔐 Connexion requise',
        'Vous devez être connecté pour commander',
        [
          { text: 'Se connecter', onPress: () => router.push('/(auth)') },
          { text: 'Retour', onPress: () => router.back(), style: 'cancel' }
        ]
      );
      return;
    }
    loadData();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.id === selectedCategory);
      const categoryName = category?.name || selectedCategory;
      
      console.log('🔍 Filtrage catégorie:', { selectedCategory, categoryName });
      
      filtered = products.filter(p => {
        // Comparaisons possibles:
        // 1. category (nom) === categoryName (nom)
        // 2. category (UUID) === selectedCategory (UUID) 
        // 3. category_id === selectedCategory
        const match = p.category === categoryName || 
                      p.category === selectedCategory ||
                      p.category_id === selectedCategory ||
                      p.category?.toLowerCase() === categoryName?.toLowerCase();
        
        return match;
      });
      
      console.log('📦 Produits filtrés:', filtered.length, filtered.map(p => p.name));
    }
    
    if (searchQuery.trim()) {
      filtered = searchProducts(filtered, searchQuery);
    }
    setFilteredProducts(filtered);
  };

  const handleProductPress = (product) => {
    if (!isAuthenticated) {
      Alert.alert('🔐 Connexion requise', 'Vous devez être connecté pour voir les détails', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)') },
        { text: 'Annuler', style: 'cancel' }
      ]);
      return;
    }
    router.push(`/product/${product.id}`);
  };

  // CORRIGÉ: Passer le prix promo au panier
  const handleQuickAdd = (product) => {
    if (!isAuthenticated) {
      Alert.alert('🔐 Connexion requise', 'Vous devez être connecté pour ajouter au panier', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)') },
        { text: 'Annuler', style: 'cancel' }
      ]);
      return;
    }
    
    // Utiliser promo_price si disponible
    const effectivePrice = product.promo_price || product.base_price || product.price || 0;
    
    useCartStore.getState().addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      base_price: product.base_price,
      promo_price: product.promo_price,
      promo_badge: product.promo_badge,
      image_url: product.image_url,
      quantity: 1,
      options: [],
    });
    Alert.alert('✅ Ajouté au panier', `${product.name} ajouté pour ${effectivePrice.toFixed(2)}€`);
  };

  const handleCartPress = () => {
    if (!isAuthenticated) {
      Alert.alert('🔐 Connexion requise', 'Vous devez être connecté pour voir le panier', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)') },
        { text: 'Annuler', style: 'cancel' }
      ]);
      return;
    }
    if (getItemCount() === 0) {
      Alert.alert('🛒 Panier vide', 'Votre panier est vide');
      return;
    }
    router.push('/(tabs)/cart');
  };

  const handleFavoritesPress = () => {
    if (!isAuthenticated) {
      Alert.alert('🔐 Connexion requise', 'Vous devez être connecté pour voir vos favoris', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)') },
        { text: 'Annuler', style: 'cancel' }
      ]);
      return;
    }
    router.push('/favorites');
  };

  // CORRIGÉ: Badge promo dynamique
  const getBadgeInfo = (product) => {
    // Priorité aux promos dynamiques
    if (product.promo_price && product.promo_price < product.base_price) {
      return { 
        backgroundColor: product.promo_badge_color || '#EF4444', 
        text: product.promo_badge || '🔥 PROMO' 
      };
    }
    // Fallback sur badge statique
    if (product.badge) {
      switch(product.badge) {
        case 'nouveau':
        case 'new':
          return { backgroundColor: '#10B981', text: '🆕 NOUVEAU' };
        case 'promo':
          return { backgroundColor: '#EF4444', text: '🔥 PROMO' };
        case 'bestseller':
        case 'best-seller':
          return { backgroundColor: '#F59E0B', text: '⭐ TOP VENTE' };
        case 'cashback_booste':
          return { backgroundColor: '#8B5CF6', text: '💰 CASHBACK' };
        default:
          return { backgroundColor: '#6B7280', text: product.badge };
      }
    }
    return null;
  };

  const renderProduct = ({ item }) => {
    // CORRIGÉ: Utiliser promo_price si disponible
    const hasPromo = item.promo_price && item.promo_price < item.base_price;
    const displayPrice = hasPromo ? item.promo_price : (item.base_price || 0);
    const originalPrice = item.base_price || 0;
    const badgeInfo = getBadgeInfo(item);
    
    return (
      <View style={styles.productWrapper}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => handleProductPress(item)}
          activeOpacity={0.7}
        >
          {/* Badge promo dynamique ou statique */}
          {badgeInfo && (
            <View style={[styles.badge, { backgroundColor: badgeInfo.backgroundColor }]}>
              <Text style={styles.badgeText}>{badgeInfo.text}</Text>
            </View>
          )}

          {/* Bouton Favori */}
          <TouchableOpacity
            style={[styles.favBadge, isFavorite(item.id) && styles.favBadgeActive]}
            onPress={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                Alert.alert('🔐 Connexion requise', 'Connectez-vous pour ajouter aux favoris');
                return;
              }
              toggleFavorite(item.id);
            }}
          >
            <Text style={styles.favIcon}>{isFavorite(item.id) ? '⭐' : '☆'}</Text>
          </TouchableOpacity>

          {/* Image/Emoji Produit */}
          <View style={styles.productImage}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.productImg}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.productEmoji}>{item.emoji || '🍔'}</Text>
            )}
          </View>

          {/* Info Produit */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.productFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>{displayPrice.toFixed(2)}€</Text>
                {hasPromo && (
                  <Text style={styles.originalPrice}>{originalPrice.toFixed(2)}€</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(item);
                }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Commander</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.favButton} onPress={handleFavoritesPress}>
              <Text style={styles.favButtonText}>⭐</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cartBadgeContainer} onPress={handleCartPress}>
              <Text style={styles.cartIcon}>🛒</Text>
              {/* CORRIGÉ: Afficher 2 décimales */}
              <Text style={styles.cartAmount}>{getTotal().toFixed(2)}€</Text>
              {getItemCount() > 0 && (
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>{getItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 24, color: '#1A1A1A' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  favButtonText: { fontSize: 20 },
  cartBadgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  cartIcon: { fontSize: 18 },
  cartAmount: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  cartCount: { backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cartCountText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 12 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: '#1A1A1A' },
  categories: { paddingHorizontal: 16 },
  categoriesContent: { paddingRight: 16 },
  productsGrid: { padding: 16 },
  productWrapper: { width: '50%', padding: 6 },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  badge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  favBadge: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  favBadgeActive: { backgroundColor: '#FEF3C7' },
  favIcon: { fontSize: 18 },
  productImage: { height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden', borderRadius: 12 },
  productImg: { width: '100%', height: '100%', borderRadius: 12 },
  productEmoji: { fontSize: 60 },
  productInfo: { gap: 4 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  productDesc: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceContainer: { flexDirection: 'column' },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  originalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});
