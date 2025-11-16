import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated'
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme'
import Button from '../components/Button'

export default function OrderSuccessScreen() {
  const router = useRouter()
  const { orderId, total, cashbackEarned } = useLocalSearchParams()
  
  const scale = useSharedValue(0)
  const checkmarkScale = useSharedValue(0)
  const opacity = useSharedValue(0)
  
  useEffect(() => {
    // Animation sequence
    scale.value = withSpring(1, { damping: 10 })
    checkmarkScale.value = withDelay(200, withSequence(
      withSpring(1.2),
      withSpring(1)
    ))
    opacity.value = withDelay(400, withSpring(1))
  }, [])
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))
  
  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }]
  }))
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, containerStyle]}>
          <Animated.View style={checkmarkStyle}>
            <Ionicons name="checkmark-circle" size={120} color={Colors.success} />
          </Animated.View>
        </Animated.View>
        
        {/* Success Message */}
        <Animated.View style={[styles.textContainer, contentStyle]}>
          <Text style={styles.title}>Commande confirmée !</Text>
          <Text style={styles.subtitle}>
            Merci pour ta commande {orderId ? `#${orderId}` : ''}
          </Text>
        </Animated.View>
        
        {/* Order Details */}
        <Animated.View style={[styles.detailsCard, contentStyle]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant payé</Text>
            <Text style={styles.detailValue}>{total ? `${parseFloat(total).toFixed(2)}€` : 'N/A'}</Text>
          </View>
          
          {cashbackEarned && parseFloat(cashbackEarned) > 0 && (
            <View style={[styles.detailRow, styles.cashbackRow]}>
              <View style={styles.cashbackLeft}>
                <Ionicons name="wallet" size={20} color={Colors.success} />
                <Text style={styles.cashbackLabel}>Cashback gagné</Text>
              </View>
              <Text style={styles.cashbackValue}>+{parseFloat(cashbackEarned).toFixed(2)}€</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Tu recevras une notification dès que ta commande sera prête
            </Text>
          </View>
        </Animated.View>
        
        {/* Actions */}
        <Animated.View style={[styles.actions, contentStyle]}>
          <Button
            title="Voir mes commandes"
            onPress={() => router.push('/orders')}
            variant="secondary"
            fullWidth
            icon={<Ionicons name="receipt" size={20} color={Colors.primary} />}
          />
          <Button
            title="Retour à l'accueil"
            onPress={() => router.push('/')}
            fullWidth
            icon={<Ionicons name="home" size={20} color={Colors.white} />}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xxl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.l,
    color: Colors.gray600,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    marginBottom: Spacing.xxl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.m,
  },
  detailLabel: {
    fontSize: Typography.m,
    color: Colors.gray700,
    fontWeight: Typography.medium,
  },
  detailValue: {
    fontSize: Typography.xl,
    color: Colors.gray900,
    fontWeight: Typography.bold,
  },
  cashbackRow: {
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.m,
  },
  cashbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  cashbackLabel: {
    fontSize: Typography.m,
    color: Colors.success,
    fontWeight: Typography.semibold,
  },
  cashbackValue: {
    fontSize: Typography.xl,
    color: Colors.success,
    fontWeight: Typography.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: Spacing.m,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.s,
    color: Colors.gray600,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: Spacing.m,
  },
})
