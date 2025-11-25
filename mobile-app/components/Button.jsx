import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../constants/theme'

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
          color: Colors.white
        }
      case 'secondary':
        return {
          backgroundColor: Colors.secondary,
          color: Colors.black
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: Colors.primary,
          borderWidth: 2,
          borderColor: Colors.primary
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: Colors.primary
        }
      default:
        return {
          backgroundColor: Colors.primary,
          color: Colors.white
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.s,
          paddingHorizontal: Spacing.l,
          fontSize: Typography.s
        }
      case 'medium':
        return {
          paddingVertical: Spacing.m,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.m
        }
      case 'large':
        return {
          paddingVertical: Spacing.l,
          paddingHorizontal: Spacing.xxl,
          fontSize: Typography.l
        }
      default:
        return {
          paddingVertical: Spacing.m,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.m
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: (disabled || pressed) ? 0.7 : 1,
          width: fullWidth ? '100%' : 'auto'
        },
        variant !== 'ghost' && Shadows.small
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.color} />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, { color: variantStyles.color, fontSize: sizeStyles.fontSize }]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
  },
  text: {
    fontWeight: Typography.semibold,
  }
})

export default Button
