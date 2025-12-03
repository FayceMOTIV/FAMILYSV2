import api from './api';

/**
 * Service pour le module Surprise du Jour
 * Gère les interactions avec l'API backend
 */

export const surpriseDuJourService = {
  /**
   * Récupère le statut du jeu pour l'utilisateur
   */
  getSpinStatus: async (userId) => {
    try {
      const response = await api.get('/surprise-du-jour/status', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting spin status:', error);
      throw error;
    }
  },

  /**
   * Lance le jeu et récupère la récompense
   */
  playSpin: async (userId, userEmail, userName) => {
    try {
      const response = await api.post('/surprise-du-jour/play', null, {
        params: { 
          user_id: userId,
          user_email: userEmail,
          user_name: userName
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error playing spin:', error);
      throw error;
    }
  },

  /**
   * Récupère les récompenses de l'utilisateur
   */
  getUserRewards: async (userId) => {
    try {
const response = await api.get(`/surprise-du-jour/rewards/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user rewards:', error);
      throw error;
    }
  },

  /**
   * Réclame une récompense
   */
  claimReward: async (rewardId) => {
    try {
      const response = await api.post(`/surprise-du-jour/claim/${rewardId}`);
      return response.data;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }
};

/**
 * Formate une récompense pour l'affichage
 */
export const formatReward = (reward) => {
  const emojis = {
    'discount': '💸',
    'product': '🍔',
    'menu': '🍕',
    'dessert': '🍰',
    'cashback': '💰'
  };

  return {
    ...reward,
    emoji: emojis[reward.reward_type] || '🎁',
    displayValue: reward.reward_type === 'discount' 
      ? `${reward.reward_value}€` 
      : reward.reward_label
  };
};

/**
 * Calcule le temps restant jusqu'à minuit
 */
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  const diff = midnight - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};

export default surpriseDuJourService;
