import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../constants/theme'

const CategoryCard = ({ category, onPress, size = 'medium' }) => {
  const isSmall = size === 'small'
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSmall ? styles.cardSmall : styles.cardMedium,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{category.icon || '🍔'}</Text>
      </View>
      <Text style={[styles.name, isSmall && styles.nameSmall]} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  cardMedium: {
    minWidth: 120,
    minHeight: 120,
  },
  cardSmall: {
    minWidth: 100,
    minHeight: 100,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s,
  },
  icon: {
    fontSize: 32,
  },
  name: {
    fontSize: Typography.s,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    textAlign: 'center',
  },
  nameSmall: {
    fontSize: Typography.xs,
  },
})

export default CategoryCard
