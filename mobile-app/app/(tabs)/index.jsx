import { View, Text, ScrollView, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import SearchBar from '../../components/SearchBar'
import CategoryCard from '../../components/CategoryCard'
import ProductCard from '../../components/ProductCard'
import Badge from '../../components/Badge'

import { useCategories } from '../../hooks/useCategories'
import { useProducts } from '../../hooks/useProducts'
import SkeletonLoader from '../../components/SkeletonLoader'

export default function HomeScreen() {
  const router = useRouter()
  
  // Fetch real data
  const { categories, loading: loadingCategories } = useCategories()
  const { products, loading: loadingProducts } = useProducts()
  
  // Get popular products (is_popular flag or first 4)
  const popularProducts = products
    .filter(p => p.is_popular || p.best_seller)
    .slice(0, 4)
  
  if (popularProducts.length === 0 && products.length > 0) {
    popularProducts.push(...products.slice(0, 4))
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.location}>Bourg-en-Bresse</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Badge text="5% cashback" variant="cashback" size="small" />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar placeholder="Que veux-tu manger ?" />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoBannerContent}>
            <Text style={styles.promoBannerTitle}>🎁 Offre du jour</Text>
            <Text style={styles.promoBannerText}>Menu King à 9,90€</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200' }}
            style={styles.promoBannerImage}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          {loadingCategories ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonLoader key={i} width={100} height={100} style={{ marginRight: 12 }} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <CategoryCard 
                    category={{ ...category, icon: category.emoji || '🍽️' }}
                    size="small"
                    onPress={() => router.push('/menu')}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populaires</Text>
            <Text style={styles.seeAll} onPress={() => router.push('/menu')}>Voir tout</Text>
          </View>
          {loadingProducts ? (
            <View style={styles.productsGrid}>
              {[1, 2].map((i) => (
                <SkeletonLoader key={i} height={280} style={{ marginBottom: 16 }} />
              ))}
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {popularProducts.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <ProductCard 
                    product={{
                      ...product,
                      image: product.image_url || product.image,
                      hasPromo: product.has_promotion || false,
                      cashback: ((product.price * 0.05).toFixed(2))
                    }}
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  location: {
    fontSize: Typography.s,
    color: Colors.gray600,
  },
  headerRight: {
    marginTop: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
  },
  promoBanner: {
    marginHorizontal: Spacing.l,
    marginTop: Spacing.l,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.l,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  promoBannerContent: {
    flex: 1,
    padding: Spacing.l,
    justifyContent: 'center',
  },
  promoBannerTitle: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  promoBannerText: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  promoBannerImage: {
    width: 120,
    height: 120,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  seeAll: {
    fontSize: Typography.s,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  categoriesScroll: {
    gap: Spacing.m,
  },
  categoryItem: {
    width: 100,
  },
  productsGrid: {
    gap: Spacing.l,
  },
  productItem: {
    marginBottom: Spacing.l,
  },
})
