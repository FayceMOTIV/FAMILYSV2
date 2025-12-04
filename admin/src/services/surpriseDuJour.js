/**
 * Service API pour le module Surprise du Jour
 * Module 100% indépendant
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const BASE_PATH = `${API_URL}/api/v1/surprise-du-jour`;

// ==================== STATS & DASHBOARD ====================

export const getStats = async () => {
  try {
    const response = await axios.get(`${BASE_PATH}/admin/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur getStats:', error);
    throw error;
  }
};

// ==================== CONFIG / PROBABILITÉS ====================

export const getConfigs = async (activeOnly = false) => {
  try {
    const response = await axios.get(`${BASE_PATH}/admin/config`, {
      params: { active_only: activeOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur getConfigs:', error);
    throw error;
  }
};

export const createConfig = async (configData) => {
  try {
    const response = await axios.post(`${BASE_PATH}/admin/config`, configData);
    return response.data;
  } catch (error) {
    console.error('Erreur createConfig:', error);
    throw error;
  }
};

export const updateConfig = async (configId, updateData) => {
  try {
    const response = await axios.put(`${BASE_PATH}/admin/config/${configId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Erreur updateConfig:', error);
    throw error;
  }
};

export const deleteConfig = async (configId) => {
  try {
    const response = await axios.delete(`${BASE_PATH}/admin/config/${configId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur deleteConfig:', error);
    throw error;
  }
};

// ==================== RÉCOMPENSES ====================

export const getAllRewards = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_PATH}/admin/rewards`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur getAllRewards:', error);
    throw error;
  }
};

export const extendReward = async (rewardId, days = 7) => {
  try {
    const response = await axios.post(`${BASE_PATH}/admin/rewards/${rewardId}/extend`, null, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur extendReward:', error);
    throw error;
  }
};

export const cancelReward = async (rewardId) => {
  try {
    const response = await axios.post(`${BASE_PATH}/admin/rewards/${rewardId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Erreur cancelReward:', error);
    throw error;
  }
};

// ==================== ANTI-TRICHE ====================

export const getAntiCheatLogs = async (limit = 100) => {
  try {
    const response = await axios.get(`${BASE_PATH}/admin/anti-cheat`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur getAntiCheatLogs:', error);
    throw error;
  }
};

// ==================== TEST ====================

export const testSpin = async (userId = 'TEST_USER', forceRewardType = null) => {
  try {
    const params = { user_id: userId };
    if (forceRewardType) {
      params.force_reward_type = forceRewardType;
    }
    const response = await axios.post(`${BASE_PATH}/admin/test-spin`, null, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur testSpin:', error);
    throw error;
  }
};

export default {
  getStats,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getAllRewards,
  extendReward,
  cancelReward,
  getAntiCheatLogs,
  testSpin
};
