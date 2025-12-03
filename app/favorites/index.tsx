import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useCartStore } from '../../stores/cartStore';
import { fetchProducts, getProductPrice } from '../../services/productsService';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      const filtered = products.filter(p => favorites.includes(p.id));
      setFavoriteProducts(filtered);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id }
    });
  };

  const handleQuickAdd = (product) => {
    const price = getProductPrice(product);
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      options: [],
      supplements: {},
      removed: {},
      menuConfig: null,
    });
    Alert.alert('✅ Ajouté au panier', `${product.name} a été ajouté`);
  };

  const getBadgeStyle = (badge) => {
    switch(badge) {
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
        return { backgroundColor: '#6B7280', text: badge };
    }
  };

  const renderProduct = (product) => {
    const price = getProductPrice(product);
    const badgeStyle = product.badge ? getBadgeStyle(product.badge) : null;
    
    return (
      <View key={product.id} style={styles.productWrapper}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => handleProductPress(product)}
          activeOpacity={0.7}
        >
          {/* Badge du Backend uniquement */}
          {badgeStyle && (
            <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
              <Text style={styles.badgeText}>{badgeStyle.text}</Text>
            </View>
          )}

          {/* Bouton Favori */}
          <TouchableOpacity
            style={styles.favBadge}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
          >
            <Text style={styles.favIcon}>⭐</Text>
          </TouchableOpacity>

          {/* Image/Emoji Produit */}
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>{product.emoji || '🍽️'}</Text>
          </View>

          {/* Info Produit */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
            
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>{price.toFixed(2)} €</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(product);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : favoriteProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez vos produits{'\n'}préférés en cliquant{'\n'}sur l'étoile
            </Text>
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => router.push('/order')}
            >
              <Text style={styles.discoverButtonText}>Découvrir les produits</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {favoriteProducts.map(product => renderProduct(product))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  productWrapper: {
    width: '50%',
    padding: 6,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  favIcon: {
    fontSize: 18,
  },
  productImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 60,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  productDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  discoverButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
