import { View, Text, ScrollView, Image, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import SkeletonLoader from '../../components/SkeletonLoader'
import useCartStore from '../../stores/cartStore'
import { useProduct } from '../../hooks/useProducts'

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  
  // Fetch real product data
  const { product, loading, error } = useProduct(id)
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scroll}>
          <SkeletonLoader height={300} />
          <View style={{ padding: Spacing.l }}>
            <SkeletonLoader height={24} width="60%" style={{ marginBottom: 12 }} />
            <SkeletonLoader height={32} width="90%" style={{ marginBottom: 12 }} />
            <SkeletonLoader height={120} />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
  
  if (error || !product) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produit introuvable</Text>
          <Button title="Retour" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    )
  }
  
  const handleAddToCart = () => {
    addItem(product)
    // Show toast or navigate to cart
    router.back()
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Badges */}
          {product.hasPromo && (
            <View style={styles.promoBadge}>
              <Badge text={product.promoText} variant="promo" size="medium" />
            </View>
          )}
          
          <View style={styles.cashbackBadge}>
            <Badge text={`+${product.cashback}€ cashback`} variant="cashback" size="medium" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          <Text style={styles.category}>{product.category}</Text>
          
          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>
          
          {/* Price */}
          <View style={styles.priceRow}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{product.originalPrice.toFixed(2)}€</Text>
            )}
            <Text style={styles.price}>{product.price.toFixed(2)}€</Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
          
          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="flame" size={20} color={Colors.warning} />
              <Text style={styles.infoCardText}>{product.calories} kcal</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} />
              <Text style={styles.infoCardText}>{product.allergens.join(', ')}</Text>
            </View>
          </View>
          
          {/* Options Section (placeholder) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.optionsPlaceholder}>
              <Text style={styles.placeholderText}>À développer : options, variants, extras...</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Ajouter au panier"
          onPress={handleAddToCart}
          fullWidth
          icon={<Ionicons name="cart" size={20} color={Colors.white} />}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: Spacing.l,
    left: Spacing.l,
  },
  cashbackBadge: {
    position: 'absolute',
    top: Spacing.l,
    right: Spacing.l,
  },
  content: {
    padding: Spacing.l,
  },
  category: {
    fontSize: Typography.s,
    color: Colors.gray600,
    textTransform: 'uppercase',
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    marginBottom: Spacing.xl,
  },
  originalPrice: {
    fontSize: Typography.l,
    color: Colors.gray400,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.m,
  },
  description: {
    fontSize: Typography.m,
    color: Colors.gray700,
    lineHeight: 24,
  },
  infoCards: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    backgroundColor: Colors.gray50,
    padding: Spacing.m,
    borderRadius: BorderRadius.m,
  },
  infoCardText: {
    fontSize: Typography.s,
    color: Colors.gray700,
    flex: 1,
  },
  optionsPlaceholder: {
    backgroundColor: Colors.gray50,
    padding: Spacing.xl,
    borderRadius: BorderRadius.m,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.s,
    color: Colors.gray500,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    ...Shadows.large,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.l,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
})
