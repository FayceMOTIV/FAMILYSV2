import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

/**
 * Service pour le module Surprise du Jour
 * URLs corrigées : /api/v1/fb/surprise/*
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const surpriseDuJourService = {
  /**
   * Récupère le statut du jeu pour l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  getSpinStatus: async (userId) => {
    try {
      const response = await api.get('/surprise/status', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting spin status:', error);
      return { can_play: true, already_played: false };
    }
  },

  /**
   * Lance le jeu et récupère la récompense
   * @param {string} userId - ID de l'utilisateur
   * @param {string} userEmail - Email de l'utilisateur (optionnel)
   * @param {string} userName - Nom de l'utilisateur
   */
  playSpin: async (userId, userEmail, userName) => {
    try {
      const response = await api.post('/surprise/play', null, {
        params: { 
          user_id: userId,
          user_name: userName || 'Client'
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
   * @param {string} userId - ID de l'utilisateur
   * @param {string} status - Filtre: 'active', 'used', 'expired' ou null pour tous
   */
  getUserRewards: async (userId, status = null) => {
    try {
      const params = { user_id: userId };
      if (status) params.status = status;
      
      const response = await api.get('/surprise/rewards', { params });
      
      // Filtrer par user_id côté client si le backend ne le fait pas
      const rewards = response.data.rewards || [];
      const userRewards = rewards.filter(r => r.user_id === userId);
      
      // Transformer pour le frontend
      return userRewards.map(reward => ({
        id: reward.id,
        code: reward.code,
        type: reward.reward_type,
        value: reward.reward_value,
        label: reward.reward_label,
        emoji: getRewardEmoji(reward.reward_type),
        status: getRewardStatus(reward),
        expirationDate: reward.expires_at,
        usedDate: reward.used_at,
        productId: reward.product_id,
        productName: reward.product_name,
      }));
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return [];
    }
  },

  /**
   * Valide un code récompense (sans l'utiliser)
   * @param {string} code - Code de récompense (SDJ-XXXX)
   */
  validateReward: async (code) => {
    try {
      const response = await api.get(`/surprise/validate-reward/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error validating reward:', error);
      return { valid: false, message: 'Code invalide' };
    }
  },

  /**
   * Utilise une récompense
   * @param {string} code - Code de récompense (SDJ-XXXX)
   * @param {string} orderId - ID de la commande (optionnel)
   */
  useReward: async (code, orderId = null) => {
    try {
      const params = orderId ? { order_id: orderId } : {};
      const response = await api.post(`/surprise/use-reward/${code}`, null, { params });
      return response.data;
    } catch (error) {
      console.error('Error using reward:', error);
      throw error;
    }
  },

  /**
   * Réclame une récompense (ancien nom pour compatibilité)
   * @deprecated Utiliser useReward à la place
   */
  claimReward: async (rewardId, userId) => {
    // Chercher le code de la récompense
    try {
      const rewards = await surpriseDuJourService.getUserRewards(userId);
      const reward = rewards.find(r => r.id === rewardId);
      
      if (!reward || !reward.code) {
        throw new Error('Récompense non trouvée');
      }
      
      return await surpriseDuJourService.useReward(reward.code);
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  },

  /**
   * Récupère les derniers gagnants (pour affichage)
   * @param {number} limit - Nombre de gagnants à récupérer
   */
  getRecentWinners: async (limit = 5) => {
    try {
      const response = await api.get('/surprise/recent-winners', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recent winners:', error);
      return [];
    }
  },

  /**
   * Récupère les stats globales (pour la home)
   */
  getStats: async () => {
    try {
      const response = await api.get('/surprise/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }
};

/**
 * Helper: Obtenir l'emoji selon le type de récompense
 */
const getRewardEmoji = (type) => {
  const emojis = {
    'discount_percent': '💯',
    'discount_amount': '💰',
    'cashback': '💎',
    'product': '🍕',
    'menu': '🍽️',
  };
  return emojis[type] || '🎁';
};

/**
 * Helper: Déterminer le statut d'une récompense
 */
const getRewardStatus = (reward) => {
  if (reward.is_used) return 'used';
  
  const now = new Date();
  const expiresAt = new Date(reward.expires_at);
  
  if (expiresAt <= now) return 'expired';
  return 'active';
};

/**
 * Formate une récompense pour l'affichage
 */
export const formatReward = (reward) => {
  return {
    ...reward,
    emoji: getRewardEmoji(reward.type || reward.reward_type),
    displayValue: reward.type === 'discount_percent' || reward.reward_type === 'discount_percent'
      ? `${reward.value || reward.reward_value}%` 
      : reward.label || reward.reward_label
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
