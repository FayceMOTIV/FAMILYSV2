import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { surpriseDuJourService, getTimeUntilMidnight } from '../../services/surpriseDuJourService';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpin from '../../components/surprise/LoadingSpin';

const { width } = Dimensions.get('window');

const possibleRewards = [
  { emoji: '🍕', name: 'Pizza offerte' },
  { emoji: '💰', name: '500 points' },
  { emoji: '🎂', name: 'Dessert gratuit' },
  { emoji: '💸', name: '-20% commande' },
  { emoji: '🍔', name: 'Burger offert' },
  { emoji: '🥤', name: 'Boisson offerte' },
];

export default function SurpriseDuJour() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    checkStatus();
    
    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Animation de pulsation du cadeau
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const checkStatus = async () => {
    try {
      if (!user?.id) {
        // Pas connecté = peut jouer visuellement (mais bloqué au clic)
        setCanPlay(true);
        setHasPlayed(false);
        return;
      }

      const status = await surpriseDuJourService.getSpinStatus(user.id);
      setCanPlay(status.can_play);
      setHasPlayed(status.plays_today > 0);
    } catch (error) {
      console.error('Error checking status:', error);
      // En cas d'erreur, afficher le jeu
      setCanPlay(true);
    }
  };

  const handlePlay = async () => {
    // Vérifier connexion
    if (!user?.id) {
      Alert.alert(
        'Connexion requise',
        'Tu dois être connecté pour jouer à la Surprise du Jour !',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)') }
        ]
      );
      return;
    }

    if (!canPlay) {
      Alert.alert('Déjà joué !', 'Reviens demain pour une nouvelle surprise !');
      return;
    }

    try {
      setLoading(true);
      
      // Simuler le temps de chargement pour l'effet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await surpriseDuJourService.playSpin(
        user.id, 
        user.email || '', 
        user.name || user.firstName || 'Joueur'
      );
      
      if (result.success) {
        // Rediriger vers la page de résultat
        router.push({
          pathname: '/surprise-du-jour/result',
          params: { 
            rewardId: result.reward.id,
            rewardLabel: result.reward.reward_label,
            rewardType: result.reward.reward_type
          }
        });
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de jouer');
      }
    } catch (error) {
      console.error('Error playing:', error);
      Alert.alert('Erreur', 'Impossible de jouer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpin message="Tirage en cours..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {/* Bouton Retour */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.headerEmoji}>🎁</Text>
        <Text style={styles.headerTitle}>Surprise du Jour</Text>
        <Text style={styles.headerSubtitle}>
          Découvre ta récompense quotidienne, renouvelée chaque nuit à minuit
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {canPlay ? (
          <>
            {/* Animation Cadeau */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handlePlay}
            >
              <Animated.View 
                style={[
                  styles.giftBox,
                  { transform: [{ scale: scaleValue }] }
                ]}
              >
                <Text style={styles.giftEmoji}>🎁</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Message */}
            <Text style={styles.messageTitle}>🎉 Ta surprise t'attend !</Text>
            <Text style={styles.messageText}>
              Clique sur le cadeau pour découvrir ce que tu as gagné aujourd'hui
            </Text>

            {/* Bouton Play */}
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlay}
            >
              <Text style={styles.playButtonText}>Jouer maintenant ! 🎮</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Titre Principal */}
            <Text style={styles.alreadyPlayedTitle}>🎉 Déjà joué aujourd'hui !</Text>
            <Text style={styles.alreadyPlayedSubtitle}>
              Tu pourras retenter ta chance demain à minuit 🌙
            </Text>

            {/* Countdown Simplifié */}
            <View style={styles.countdownSimple}>
              <Text style={styles.countdownSimpleLabel}>⏱️ Nouvelle tentative dans :</Text>
              <Text style={styles.countdownSimpleTime}>
                {countdown.hours}h {String(countdown.minutes).padStart(2, '0')}min
              </Text>
            </View>

            {/* Grande Carte Verte */}
            <View style={styles.thankYouCard}>
              <Text style={styles.thankYouEmoji}>🎁</Text>
              <Text style={styles.thankYouTitle}>Merci d'avoir joué aujourd'hui !</Text>
              <Text style={styles.thankYouText}>Reviens demain pour tenter de gagner :</Text>
            </View>

            {/* Grille des Récompenses Possibles */}
            <View style={styles.rewardsSection}>
              <Text style={styles.rewardsSectionTitle}>🏆 Récompenses à Gagner</Text>
              <View style={styles.rewardsGrid}>
                {possibleRewards.map((reward, index) => (
                  <View key={index} style={styles.rewardItem}>
                    <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Boutons d'Action */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/surprise-du-jour/rewards')}
              >
                <Text style={styles.primaryButtonText}>Voir mes récompenses 🏆</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>💡</Text>
        <Text style={styles.infoText}>
          Une nouvelle surprise est disponible chaque jour à minuit !
        </Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 32,
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
    marginBottom: 16,
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
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  
  // État: Can Play (Cadeau animé)
  giftBox: {
    width: 160,
    height: 160,
    backgroundColor: '#10B981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  giftEmoji: {
    fontSize: 80,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  playButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignSelf: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // État: Already Played (Nouveau design moderne)
  alreadyPlayedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  alreadyPlayedSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  countdownSimple: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  countdownSimpleLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  countdownSimpleTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  thankYouCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  thankYouEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: '#047857',
    textAlign: 'center',
  },
  rewardsSection: {
    marginBottom: 32,
  },
  rewardsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardItem: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
