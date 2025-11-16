import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../constants/theme'

const ProductCard = ({ product, onPress }) => {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge Promo */}
        {product.hasPromo && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>🎁 -20%</Text>
          </View>
        )}
        
        {/* Badge Cashback */}
        {product.cashback && (
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackBadgeText}>+{product.cashback}€</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        
        <View style={styles.footer}>
          <View>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{product.originalPrice}€</Text>
            )}
            <Text style={styles.price}>{product.price}€</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: Colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: Spacing.s,
    left: Spacing.s,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.s,
  },
  promoBadgeText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  cashbackBadge: {
    position: 'absolute',
    top: Spacing.s,
    right: Spacing.s,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.s,
  },
  cashbackBadgeText: {
    color: Colors.black,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  content: {
    padding: Spacing.m,
  },
  name: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.s,
    color: Colors.gray600,
    marginBottom: Spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: Typography.s,
    color: Colors.gray400,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
})

export default ProductCard
