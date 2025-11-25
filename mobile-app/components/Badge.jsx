import { View, Text, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme'

const Badge = ({ text, variant = 'primary', size = 'medium' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: Colors.primary, color: Colors.white }
      case 'secondary':
        return { backgroundColor: Colors.secondary, color: Colors.black }
      case 'success':
        return { backgroundColor: Colors.success, color: Colors.white }
      case 'warning':
        return { backgroundColor: Colors.warning, color: Colors.white }
      case 'error':
        return { backgroundColor: Colors.error, color: Colors.white }
      case 'promo':
        return { backgroundColor: Colors.error, color: Colors.white }
      case 'cashback':
        return { backgroundColor: Colors.secondary, color: Colors.black }
      default:
        return { backgroundColor: Colors.primary, color: Colors.white }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: Spacing.xs, paddingVertical: 2, fontSize: Typography.xs }
      case 'medium':
        return { paddingHorizontal: Spacing.s, paddingVertical: Spacing.xs, fontSize: Typography.s }
      case 'large':
        return { paddingHorizontal: Spacing.m, paddingVertical: Spacing.s, fontSize: Typography.m }
      default:
        return { paddingHorizontal: Spacing.s, paddingVertical: Spacing.xs, fontSize: Typography.s }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: variantStyles.backgroundColor,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
      }
    ]}>
      <Text style={[
        styles.text,
        { color: variantStyles.color, fontSize: sizeStyles.fontSize }
      ]}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.s,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: Typography.bold,
  },
})

export default Badge
