import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#C62828', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

const Confetti = ({ delay, color, startX }: { delay: number; color: string; startX: number }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: height + 100,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: (Math.random() - 0.5) * 200,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: Math.random() * 10,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderNumber, total, paymentMethod } = useLocalSearchParams();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      'card': 'Carte bancaire',
      'apple_pay': 'Apple Pay',
      'on_site': 'Sur place',
    };
    return labels[method] || method;
  };

  const confettiElements = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1000,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    startX: Math.random() * width,
  }));

  return (
    <View style={styles.container}>
      {/* Confettis */}
      {confettiElements.map((conf) => (
        <Confetti key={conf.id} delay={conf.delay} color={conf.color} startX={conf.startX} />
      ))}

      {/* Contenu */}
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}>
          <Text style={styles.icon}>🎉</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeValue }}>
          <Text style={styles.title}>Merci pour votre commande !</Text>
          
          <View style={styles.card}>
            <View style={styles.orderNumberContainer}>
              <Text style={styles.orderLabel}>Commande n°</Text>
              <Text style={styles.orderNumber}>{orderNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.detailValue}>{total}€</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paiement</Text>
              <Text style={styles.detailValue}>{getPaymentLabel(paymentMethod as string)}</Text>
            </View>
          </View>

          {paymentMethod === 'on_site' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Vous paierez sur place lors du retrait de votre commande (CB, espèces ou ticket restaurant)
              </Text>
            </View>
          )}

          <View style={styles.messageCard}>
            <Text style={styles.messageEmoji}>👨‍🍳</Text>
            <Text style={styles.messageTitle}>Votre commande est en préparation !</Text>
            <Text style={styles.messageText}>
              Nous vous préviendrons dès qu'elle sera prête.
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <Text style={styles.primaryButtonText}>Suivre ma commande 📍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 20,
    borderRadius: 2,
    zIndex: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  orderNumberContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C62828',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  messageEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#C62828',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
