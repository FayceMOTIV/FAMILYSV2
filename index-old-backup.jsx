import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Données mockées - à connecter à l'API
const newProducts = [
  { 
    id: 1, 
    name: "Nouveau Burger Deluxe", 
    price: 12.90, 
    tag: "NOUVEAU", 
    image_url: null 
  },
  { 
    id: 2, 
    name: "Menu Spécial Été", 
    price: 15.50, 
    tag: "PROMO -20%", 
    image_url: null 
  },
  { 
    id: 3, 
    name: "Dessert du Mois", 
    price: 5.90, 
    tag: "NOUVEAU", 
    image_url: null 
  }
];

const recentWinners = [
  { name: "Alex", reward: "Pizza gratuite 🍕", time: "Il y a 2h" },
  { name: "Sophie", reward: "500 points ⭐", time: "Il y a 5h" },
  { name: "Thomas", reward: "-20% prochaine commande", time: "Hier" },
  { name: "Julie", reward: "Dessert offert 🍰", time: "Hier" }
];

export default function HomeScreen() {
  const router = useRouter();
  const [pulseAnim] = useState(new Animated.Value(1));

  // Données utilisateur mock
  const userData = {
    firstName: "Client",
    loyaltyBalance: 24.50,
    loyaltyPercentage: 5,
    totalSpent: 490
  };

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = userData.firstName;
    
    if (hour < 12) return `Bon matin ${firstName} ! ☕`;
    if (hour < 18) return `Yo ${firstName}, une petite faim ? 🍔`;
    return `Soirée gourmande en vue, ${firstName} ? 😋`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec Logo centré */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>Prêt(e) à te régaler ?</Text>
      </View>

      {/* Carte Cagnotte avec Logo Watermark + Pulse */}
      <Animated.View style={[styles.loyaltyCard, { transform: [{ scale: pulseAnim }] }]}>
        <Image 
          source={require('../../assets/images/logo.png')}
          style={styles.watermarkLogo}
          resizeMode="contain"
        />
        
        <Text style={styles.loyaltyLabel}>Ma Cagnotte</Text>
        <Text style={styles.loyaltyAmount}>{userData.loyaltyBalance.toFixed(2)} €</Text>
        <Text style={styles.loyaltySubtext}>
          {userData.loyaltyPercentage}% sur chaque achat
        </Text>
        
        <TouchableOpacity 
          style={styles.useBalanceButton}
          onPress={() => router.push('/loyalty')}
        >
          <Text style={styles.useBalanceText}>Utiliser ma cagnotte 💰</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Section Jeux */}
      <TouchableOpacity 
        style={styles.gameCard}
        onPress={() => router.push('/surprise')}
      >
        <View style={styles.gameContent}>
          <Text style={styles.gameEmoji}>🎮</Text>
          <Text style={styles.gameTitle}>Jouer & Gagner</Text>
          <Text style={styles.gameDesc}>Participe aux jeux et gagne des récompenses !</Text>
        </View>
        <Text style={styles.gameIcon}>🎯</Text>
      </TouchableOpacity>

      {/* Derniers Gagnants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Derniers Gagnants</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.winnersScroll}
        >
          {recentWinners.map((winner, index) => (
            <View key={index} style={styles.winnerCard}>
              <View style={styles.winnerHeader}>
                <View style={styles.winnerAvatar}>
                  <Text style={styles.winnerInitial}>{winner.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.winnerName}>{winner.name}</Text>
                  <Text style={styles.winnerTime}>{winner.time}</Text>
                </View>
              </View>
              <Text style={styles.winnerReward}>✨ {winner.reward}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Stats Rapides */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userData.totalSpent}€</Text>
          <Text style={styles.statLabel}>Dépensés</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🎁</Text>
          <Text style={styles.statLabel}>Récompenses</Text>
        </View>
      </View>

      {/* Section Nouveautés */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✨ Nouveautés & Promos</Text>
          <TouchableOpacity onPress={() => router.push('/menu')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsScroll}
        >
          {newProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => router.push('/menu')}
            >
              <View style={styles.productTag}>
                <Text style={styles.productTagText}>{product.tag}</Text>
              </View>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🍔</Text>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price.toFixed(2)} €</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>Ajouter +</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Actions Rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/menu')}
          >
            <Text style={styles.actionEmoji}>🛍️</Text>
            <Text style={styles.actionText}>Commander</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/orders')}
          >
            <Text style={styles.actionEmoji}>📜</Text>
            <Text style={styles.actionText}>Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.actionEmoji}>👤</Text>
            <Text style={styles.actionText}>Mon Profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Badge Sécurité */}
      <View style={styles.securityBadge}>
        <Text style={styles.securityEmoji}>🔒</Text>
        <Text style={styles.securityText}>Paiement 100% sécurisé</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loyaltyCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkLogo: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 140,
    height: 80,
    opacity: 0.15,
    transform: [{ rotate: '-15deg' }],
  },
  loyaltyLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  loyaltyAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loyaltySubtext: {
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 20,
  },
  useBalanceButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  useBalanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  gameCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#10B981',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gameContent: {
    flex: 1,
  },
  gameEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  gameIcon: {
    fontSize: 32,
    opacity: 0.9,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  winnersScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  winnerCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  winnerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  winnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  winnerTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  winnerReward: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  productsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: width * 0.45,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  productTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 48,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '600',
  },
});
