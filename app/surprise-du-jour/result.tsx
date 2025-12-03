import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';

export default function ResultScreen() {
  const router = useRouter();
  const { rewardId, rewardLabel, rewardType } = useLocalSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const [claimed, setClaimed] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const getEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      'discount': '💸',
      'product': '🍔',
      'menu': '🍕',
      'dessert': '🍰',
      'cashback': '💰'
    };
    return emojis[type] || '🎁';
  };

  useEffect(() => {
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClaim = async () => {
    if (rewardType === 'product' || rewardType === 'menu' || rewardType === 'dessert') {
      addItem({
        id: rewardId as string,
        name: rewardLabel as string,
        price: 0,
        quantity: 1,
        fromReward: true,
        rewardId: rewardId as string,
      });
      Alert.alert(
        'Ajouté au panier !',
        `${rewardLabel} a été ajouté à votre panier`,
        [
          { text: 'Voir le panier', onPress: () => router.push('/cart') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } else if (rewardType === 'discount') {
      Alert.alert(
        'Réduction appliquée !',
        `La réduction sera appliquée sur votre prochaine commande`,
        [
          { text: 'Commander', onPress: () => router.push('/menu') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } else if (rewardType === 'cashback') {
      Alert.alert('Points ajoutés !', `Points ajoutés à votre cagnotte`, [{ text: 'OK' }]);
    }
    setClaimed(true);
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.confettiContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.Text 
            key={i} 
            style={[
              styles.confetti, 
              { 
                left: `${Math.random() * 100}%`, 
                top: -20, 
                opacity: scaleValue 
              }
            ]}
          >
            🎉
          </Animated.Text>
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.rewardCircle, 
            { transform: [{ scale: scaleValue }, { rotate }] }
          ]}
        >
          <Text style={styles.rewardEmoji}>{getEmoji(rewardType as string)}</Text>
        </Animated.View>
        
        <Text style={styles.title}>🎉 Félicitations ! 🎉</Text>
        <Text style={styles.subtitle}>Tu as gagné :</Text>
        
        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>{rewardLabel}</Text>
        </View>

        <View style={styles.buttons}>
          {!claimed && (
            <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
              <Text style={styles.claimButtonText}>Utiliser maintenant 🎁</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.rewardsButton, claimed && styles.rewardsButtonPrimary]} 
            onPress={() => router.push('/surprise-du-jour/rewards')}
          >
            <Text style={[styles.rewardsButtonText, claimed && styles.rewardsButtonTextPrimary]}>
              Voir mes récompenses 🏆
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push('/')}
          >
            <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomMessage}>
        <Text style={styles.bottomMessageText}>
          💡 Reviens demain pour une nouvelle surprise !
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  confettiContainer: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 1, 
    pointerEvents: 'none' 
  },
  confetti: { 
    position: 'absolute', 
    fontSize: 24 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 60 
  },
  rewardCircle: { 
    width: 160, 
    height: 160, 
    backgroundColor: '#10B981', 
    borderRadius: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 32, 
    shadowColor: '#10B981', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 24, 
    elevation: 10 
  },
  rewardEmoji: { 
    fontSize: 80 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 18, 
    color: '#6B7280', 
    marginBottom: 24 
  },
  rewardCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 5 
  },
  rewardTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    textAlign: 'center' 
  },
  buttons: { 
    width: '100%', 
    gap: 12 
  },
  claimButton: { 
    backgroundColor: '#10B981', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    shadowColor: '#10B981', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 6 
  },
  claimButtonText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  rewardsButton: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#F59E0B', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  rewardsButtonPrimary: { 
    backgroundColor: '#F59E0B', 
    borderColor: '#F59E0B' 
  },
  rewardsButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#F59E0B' 
  },
  rewardsButtonTextPrimary: { 
    color: '#FFFFFF' 
  },
  homeButton: { 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  homeButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#6B7280' 
  },
  bottomMessage: { 
    backgroundColor: '#EFF6FF', 
    padding: 16, 
    margin: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#DBEAFE' 
  },
  bottomMessageText: { 
    fontSize: 14, 
    color: '#1E40AF', 
    textAlign: 'center', 
    fontWeight: '600' 
  },
});
