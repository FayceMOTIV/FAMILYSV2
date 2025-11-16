import { View, Text, ScrollView, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import SearchBar from '../../components/SearchBar'
import CategoryCard from '../../components/CategoryCard'
import ProductCard from '../../components/ProductCard'
import Badge from '../../components/Badge'

export default function HomeScreen() {
  const router = useRouter()

  // Mock data
  const categories = [
    { id: '1', name: 'Burgers', icon: '🍔' },
    { id: '2', name: 'Pizzas', icon: '🍕' },
    { id: '3', name: 'Salades', icon: '🥗' },
    { id: '4', name: 'Desserts', icon: '🍰' },
    { id: '5', name: 'Boissons', icon: '🥤' },
  ]

  const popularProducts = [
    {
      id: '1',
      name: 'Family\'s Burger',
      description: 'Notre burger signature avec fromage et sauce secrète',
      price: 12.90,
      originalPrice: 15.90,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      hasPromo: true,
      cashback: '0.65',
    },
    {
      id: '2',
      name: 'Pizza Margherita',
      description: 'Pizza traditionnelle italienne',
      price: 11.50,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      cashback: '0.58',
    },
  ]

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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <CategoryCard 
                  category={category}
                  size="small"
                  onPress={() => router.push('/menu')}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populaires</Text>
            <Text style={styles.seeAll}>Voir tout</Text>
          </View>
          <View style={styles.productsGrid}>
            {popularProducts.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <ProductCard 
                  product={product}
                  onPress={() => router.push(`/product/${product.id}`)}
                />
              </View>
            ))}
          </View>
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
