import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme'
import SearchBar from '../../components/SearchBar'
import ProductCard from '../../components/ProductCard'

export default function MenuScreen() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Tout', icon: '🍽️' },
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
    { id: 'salads', name: 'Salades', icon: '🥗' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
  ]

  const products = [
    {
      id: '1',
      name: 'Family\'s Burger',
      description: 'Notre burger signature',
      price: 12.90,
      originalPrice: 15.90,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      hasPromo: true,
      cashback: '0.65',
      category: 'burgers',
    },
    {
      id: '2',
      name: 'Burger Bacon',
      description: 'Bacon croustillant et fromage',
      price: 13.50,
      image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400',
      cashback: '0.68',
      category: 'burgers',
    },
    {
      id: '3',
      name: 'Pizza Margherita',
      description: 'Pizza traditionnelle italienne',
      price: 11.50,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      cashback: '0.58',
      category: 'pizzas',
    },
    {
      id: '4',
      name: 'Salade César',
      description: 'Poulet grillé, croûtons, parmesan',
      price: 9.90,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      cashback: '0.50',
      category: 'salads',
    },
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

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
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <ProductCard
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            </View>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
          </View>
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
