import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme'
import SearchBar from '../../components/SearchBar'
import ProductCard from '../../components/ProductCard'

import { useCategories } from '../../hooks/useCategories'
import { useProducts } from '../../hooks/useProducts'
import SkeletonLoader from '../../components/SkeletonLoader'

export default function MenuScreen() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch real data
  const { categories: rawCategories, loading: loadingCategories } = useCategories()
  const { products: rawProducts, loading: loadingProducts } = useProducts()
  
  // Add "All" category
  const categories = [
    { id: 'all', name: 'Tout', emoji: '🍽️' },
    ...rawCategories.map(cat => ({ ...cat, emoji: cat.emoji || cat.icon || '🍽️' }))
  ]
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? rawProducts 
    : rawProducts.filter(p => p.category_id === selectedCategory || p.category === selectedCategory)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar placeholder="Rechercher un produit..." />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingProducts ? (
          <View style={styles.productsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} height={280} style={{ marginBottom: 16 }} />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
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

            {filteredProducts.length === 0 && !loadingProducts && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
  },
  header: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  searchContainer: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
  },
  categoriesContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    gap: Spacing.s,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: Typography.m,
  },
  categoryName: {
    fontSize: Typography.s,
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  categoryNameActive: {
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  productsGrid: {
    gap: Spacing.l,
  },
  productItem: {
    marginBottom: Spacing.l,
  },
  empty: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.m,
    color: Colors.gray500,
  },
})
