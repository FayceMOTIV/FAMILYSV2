import { View, Text, ScrollView, Image, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import SkeletonLoader from '../../components/SkeletonLoader'
import OptionSelector from '../../components/OptionSelector'
import NotesInput from '../../components/NotesInput'
import useCartStore from '../../stores/cartStore'
import useFavoriteStore from '../../stores/favoriteStore'
import { useProduct } from '../../hooks/useProducts'
import api from '../../services/api'

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  
  const [selectedOptions, setSelectedOptions] = useState({})
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  
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
    // Validate required options
    if (product.option_groups) {
      for (const group of product.option_groups) {
        if (group.required && !selectedOptions[group.id]) {
          Alert.alert('Option requise', `Veuillez sélectionner ${group.name}`)
          return
        }
      }
    }
    
    // Calculate total price with options
    let totalPrice = product.price * quantity
    Object.values(selectedOptions).forEach(option => {
      if (Array.isArray(option)) {
        option.forEach(opt => totalPrice += (opt.delta_price || 0) * quantity)
      } else if (option) {
        totalPrice += (option.delta_price || 0) * quantity
      }
    })
    
    const itemToAdd = {
      ...product,
      quantity,
      selectedOptions,
      notes,
      totalPrice,
    }
    
    addItem(itemToAdd)
    Alert.alert('Succès', `${product.name} ajouté au panier`)
    console.log('✅ Added to cart:', product.name)
  }
  
  const handleOptionChange = (groupId, choice) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: choice
    }))
  }
  
  const getTotalPrice = () => {
    let total = product.price * quantity
    Object.values(selectedOptions).forEach(option => {
      if (Array.isArray(option)) {
        option.forEach(opt => total += (opt.delta_price || 0) * quantity)
      } else if (option) {
        total += (option.delta_price || 0) * quantity
      }
    })
    return total
  }
  
  const handleFavoriteToggle = () => {
    const isNowFavorite = toggleFavorite(product)
    Alert.alert(
      isNowFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
      isNowFavorite ? `${product.name} a été ajouté à vos favoris` : `${product.name} a été retiré de vos favoris`
    )
  }
  
  const cashbackAmount = (product.price * 0.05).toFixed(2)
  const imageUrl = product.image_url || product.image || 'https://via.placeholder.com/800x400'
  const categoryName = product.category_name || product.category || 'Produit'

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Badges */}
          {product.has_promotion && (
            <View style={styles.promoBadge}>
              <Badge text="Promotion" variant="promo" size="medium" />
            </View>
          )}
          
          <View style={styles.cashbackBadge}>
            <Badge text={`+${cashbackAmount}€ cashback`} variant="cashback" size="medium" />
          </View>
          
          {/* Favorite button */}
          <View style={styles.favoriteButton}>
            <Button
              title=""
              onPress={handleFavoriteToggle}
              variant="secondary"
              icon={
                <Ionicons 
                  name={isFavorite(product.id) ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite(product.id) ? Colors.error : Colors.gray600} 
                />
              }
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          <Text style={styles.category}>{categoryName}</Text>
          
          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>
          
          {/* Price */}
          <View style={styles.priceRow}>
            {product.original_price && product.original_price > product.price && (
              <Text style={styles.originalPrice}>{product.original_price.toFixed(2)}€</Text>
            )}
            <Text style={styles.price}>{product.price.toFixed(2)}€</Text>
          </View>
          
          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
          
          {/* Info Cards */}
          {(product.calories || product.allergens) && (
            <View style={styles.infoCards}>
              {product.calories && (
                <View style={styles.infoCard}>
                  <Ionicons name="flame" size={20} color={Colors.warning} />
                  <Text style={styles.infoCardText}>{product.calories} kcal</Text>
                </View>
              )}
              {product.allergens && product.allergens.length > 0 && (
                <View style={styles.infoCard}>
                  <Ionicons name="alert-circle" size={20} color={Colors.error} />
                  <Text style={styles.infoCardText}>
                    {Array.isArray(product.allergens) 
                      ? product.allergens.join(', ') 
                      : product.allergens}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Options Section */}
          {product.option_groups && product.option_groups.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personnalise ton produit</Text>
              {product.option_groups.map((group) => (
                <OptionSelector
                  key={group.id}
                  optionGroup={group}
                  selectedOptions={selectedOptions}
                  onOptionChange={handleOptionChange}
                />
              ))}
            </View>
          )}
          
          {/* Notes Section */}
          <NotesInput value={notes} onChange={setNotes} />
          
          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantitySelector}>
              <Button
                title=""
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                variant="secondary"
                icon={<Ionicons name="remove" size={20} color={Colors.gray900} />}
              />
              <Text style={styles.quantityText}>{quantity}</Text>
              <Button
                title=""
                onPress={() => setQuantity(quantity + 1)}
                variant="secondary"
                icon={<Ionicons name="add" size={20} color={Colors.gray900} />}
              />
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
