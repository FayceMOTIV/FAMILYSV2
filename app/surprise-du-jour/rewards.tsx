import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { surpriseDuJourService } from '../../services/surpriseDuJourService';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { RewardCard } from '../../components/surprise/RewardCard';

type TabType = 'active' | 'used' | 'expired';

interface Reward {
  id: string;
  emoji: string;
  label: string;
  value?: string;
  type: string;
  expirationDate?: string;
  usedDate?: string;
  status: 'active' | 'used' | 'expired';
}

export default function MyRewards() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const data = await surpriseDuJourService.getUserRewards(user.id);
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Erreur', 'Impossible de charger les récompenses');
    } finally {
      setLoading(false);
    }
  };

  const handleUseReward = async (reward: Reward) => {
    try {
      if (!user?.id) return;

      const result = await surpriseDuJourService.claimReward(reward.id, user.id);
      
      // Selon le type de récompense
      if (reward.type === 'product' || reward.type === 'menu') {
        // Ajouter au panier à 0€
        addItem({
          id: reward.id,
          name: reward.label,
          price: 0,
          quantity: 1,
          fromReward: true,
          rewardId: reward.id,
        });
        
        Alert.alert(
          'Ajouté au panier !',
          `${reward.label} a été ajouté à votre panier`,
          [
            {
              text: 'Voir le panier',
              onPress: () => router.push('/cart'),
            },
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => loadRewards(), // Recharger pour mettre à jour le statut
            },
          ]
        );
      } else if (reward.type === 'discount') {
        Alert.alert(
          'Réduction appliquée !',
          `${reward.value} sera appliqué sur votre prochaine commande`,
          [
            {
              text: 'Commander',
              onPress: () => router.push('/menu'),
            },
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => loadRewards(),
            },
          ]
        );
      } else if (reward.type === 'cashback') {
        Alert.alert('Points ajoutés !', `${reward.value} points ajoutés à votre cagnotte`);
        loadRewards();
      }
    } catch (error) {
      console.error('Error using reward:', error);
      Alert.alert('Erreur', 'Impossible d\'utiliser la récompense');
    }
  };

  const getFilteredRewards = () => {
    return rewards.filter(reward => reward.status === activeTab);
  };

  const getTabCount = (tab: TabType) => {
    return rewards.filter(reward => reward.status === tab).length;
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diff = expiration.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderRewardCard = (reward: Reward) => {
    const daysLeft = reward.expirationDate ? getDaysUntilExpiration(reward.expirationDate) : null;
    const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

    return (
      <View key={reward.id} style={styles.rewardCard}>
        {/* Header */}
        <View style={styles.rewardHeader}>
          <View style={styles.rewardEmoji}>
            <Text style={styles.rewardEmojiText}>{reward.emoji}</Text>
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardLabel}>{reward.label}</Text>
            {reward.value && (
              <Text style={styles.rewardValue}>{reward.value}</Text>
            )}
          </View>
        </View>

        {/* Date/Status */}
        <View style={styles.rewardDate}>
          {reward.status === 'active' && reward.expirationDate && (
            <>
              <Text style={styles.dateLabel}>⏰ Expiration :</Text>
              <Text style={[styles.dateText, isExpiringSoon && styles.dateTextWarning]}>
                {daysLeft !== null && daysLeft > 0 
                  ? `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                  : formatDate(reward.expirationDate)
                }
              </Text>
            </>
          )}
          {reward.status === 'used' && reward.usedDate && (
            <>
              <Text style={styles.dateLabel}>✅ Utilisée le :</Text>
              <Text style={styles.dateText}>{formatDate(reward.usedDate)}</Text>
            </>
          )}
          {reward.status === 'expired' && reward.expirationDate && (
            <>
              <Text style={styles.dateLabel}>❌ Expirée le :</Text>
              <Text style={styles.dateText}>{formatDate(reward.expirationDate)}</Text>
            </>
          )}
        </View>

        {/* Bouton Utiliser (seulement pour les actives) */}
        {reward.status === 'active' && (
          <TouchableOpacity 
            style={styles.useButton}
            onPress={() => handleUseReward(reward)}
          >
            <Text style={styles.useButtonText}>Utiliser 🛒</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Bouton Retour */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.headerTitle}>Mes Récompenses</Text>
        <Text style={styles.headerSubtitle}>
          Gérez toutes vos récompenses en un seul endroit
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Actives ({getTabCount('active')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'used' && styles.tabActive]}
          onPress={() => setActiveTab('used')}
        >
          <Text style={[styles.tabText, activeTab === 'used' && styles.tabTextActive]}>
            Utilisées ({getTabCount('used')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expired' && styles.tabActive]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[styles.tabText, activeTab === 'expired' && styles.tabTextActive]}>
            Expirées ({getTabCount('expired')})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : getFilteredRewards().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {activeTab === 'active' ? '🎁' : activeTab === 'used' ? '✅' : '❌'}
            </Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' 
                ? 'Aucune récompense active' 
                : activeTab === 'used'
                ? 'Aucune récompense utilisée'
                : 'Aucune récompense expirée'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active' 
                ? 'Joue à la Surprise du Jour pour gagner des récompenses !' 
                : activeTab === 'used'
                ? 'Vos récompenses utilisées apparaîtront ici'
                : 'Les récompenses expirées apparaîtront ici'}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => router.push('/surprise-du-jour')}
              >
                <Text style={styles.playButtonText}>Jouer maintenant 🎮</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          getFilteredRewards().map(reward => renderRewardCard(reward))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardEmojiText: {
    fontSize: 32,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  rewardDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  dateTextWarning: {
    color: '#EF4444',
  },
  useButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
