import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Button from '../components/Button'
import useFavoriteStore from '../stores/favoriteStore'
import useAuthStore from '../stores/authStore'

export default function FavoritesScreen() {
  const router = useRouter()
  const { favorites, getFavoriteCount } = useFavoriteStore()
  const { user } = useAuthStore()
  
  const handleProductPress = (productId) => {
    router.push(`/product/${productId}`)
  }
  
  const handleLoginPress = () => {
    router.push('/auth/login')
  }
  
  // Empty state when not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Favoris" showBack />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={Colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>Connecte-toi pour sauvegarder tes favoris</Text>
          <Text style={styles.emptyText}>
            Crée un compte gratuitement et garde tes produits préférés à portée de main
          </Text>
          <Button
            title="Se connecter"
            onPress={handleLoginPress}
            icon={<Ionicons name="log-in" size={20} color={Colors.white} />}
          />
        </View>
      </SafeAreaView>
    )
  }
  
  // Empty state when no favorites
  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Favoris" showBack />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>⭐</Text>
          </View>
          <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
          <Text style={styles.emptyText}>
            Ajoute tes produits préférés en appuyant sur le cœur ❤️
          </Text>
          <Button
            title="Découvrir le menu"
            onPress={() => router.push('/menu')}
            icon={<Ionicons name="restaurant" size={20} color={Colors.white} />}
          />
        </View>
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Favoris" showBack />
      
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Count */}
        <View style={styles.countContainer}>
          <Ionicons name="heart" size={20} color={Colors.error} />
          <Text style={styles.countText}>
            {getFavoriteCount()} {getFavoriteCount() === 1 ? 'favori' : 'favoris'}
          </Text>
        </View>
        
        {/* Products Grid */}
        <View style={styles.grid}>
          {favorites.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  countText: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
  },
  gridItem: {
    width: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyIcon: {
    marginBottom: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  emptyText: {
    fontSize: Typography.m,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
})
