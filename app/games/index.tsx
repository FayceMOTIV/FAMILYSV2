import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { surpriseDuJourService } from '../../services/surpriseDuJourService';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

interface Winner {
  name: string;
  reward: string;
  time: string;
}

const possibleRewards = [
  { emoji: '🍕', name: 'Pizza offerte', type: 'product' },
  { emoji: '💰', name: '500 points', type: 'cashback' },
  { emoji: '🎂', name: 'Dessert gratuit', type: 'dessert' },
  { emoji: '💸', name: '-20% commande', type: 'discount' },
  { emoji: '🍔', name: 'Burger offert', type: 'product' },
  { emoji: '🥤', name: 'Boisson offerte', type: 'product' },
];

export default function GamesHub() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les derniers gagnants
      const winners = await surpriseDuJourService.getRecentWinners(4);
      setRecentWinners(winners);

      // Vérifier si l'utilisateur peut jouer
      if (user?.id) {
        const status = await surpriseDuJourService.getSpinStatus(user.id, 'device-id');
        setCanPlay(status.canPlay);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {/* Bouton Retour */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Image 
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>🎮 Jeux & Récompenses</Text>
        <Text style={styles.headerSubtitle}>
          Joue chaque jour et gagne des cadeaux !
        </Text>
      </View>

      {/* Bannière Surprise du Jour */}
      <TouchableOpacity 
        style={styles.surpriseBanner}
        onPress={() => router.push('/surprise-du-jour')}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerEmoji}>🎁</Text>
            <View>
              <Text style={styles.bannerTitle}>Surprise du Jour</Text>
              <Text style={styles.bannerSubtitle}>
                {canPlay ? '✨ Disponible maintenant !' : '⏰ Reviens demain'}
              </Text>
            </View>
          </View>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Jouer →</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Mes Récompenses */}
      <TouchableOpacity 
        style={styles.rewardsCard}
        onPress={() => router.push('/surprise-du-jour/rewards')}
      >
        <View style={styles.rewardsHeader}>
          <Text style={styles.rewardsEmoji}>🏆</Text>
          <Text style={styles.rewardsTitle}>Mes Récompenses</Text>
        </View>
        <Text style={styles.rewardsSubtitle}>
          Voir toutes mes récompenses actives
        </Text>
        <View style={styles.rewardsButton}>
          <Text style={styles.rewardsButtonText}>Voir →</Text>
        </View>
      </TouchableOpacity>

      {/* Récompenses Possibles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎁 Récompenses à Gagner</Text>
        <View style={styles.rewardsGrid}>
          {possibleRewards.map((reward, index) => (
            <View key={index} style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              <Text style={styles.rewardName}>{reward.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Derniers Gagnants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👑 Derniers Gagnants</Text>
        {recentWinners.map((winner, index) => (
          <View key={index} style={styles.winnerCard}>
            <View style={styles.winnerHeader}>
              <View style={styles.winnerAvatar}>
                <Text style={styles.winnerInitial}>
                  {winner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.winnerInfo}>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerTime}>{winner.time}</Text>
              </View>
            </View>
            <View style={styles.winnerReward}>
              <Text style={styles.winnerRewardText}>✨ {winner.reward}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Comment ça marche */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Comment ça marche ?</Text>
        <View style={styles.howItWorks}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Joue une fois par jour à la Surprise du Jour
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Gagne une récompense garantie à chaque fois
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Utilise tes récompenses sur ta prochaine commande
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#10B981',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 16,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    textAlign: 'center',
  },
  surpriseBanner: {
    margin: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bannerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  rewardsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardsEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  rewardsButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardItem: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  winnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  winnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  winnerInfo: {
    flex: 1,
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
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  winnerRewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  howItWorks: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    paddingTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});
