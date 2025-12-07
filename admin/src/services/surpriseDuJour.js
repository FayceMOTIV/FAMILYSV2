/**
 * Service API pour le module Surprise du Jour (Firebase)
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/fb/surprise`;

// ==================== STATS & DASHBOARD ====================

export const getStats = async () => {
  try {
    const response = await axios.get(`${BASE_PATH}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur getStats:', error);
    return {
      spins_today: 0,
      spins_month: 0,
      active_rewards: 0,
      used_rewards: 0,
      expired_rewards: 0,
      monthly_cost: 0,
      conversion_rate: 0
    };
  }
};

// ==================== CONFIG / PROBABILITÉS ====================

export const getConfigs = async () => {
  try {
    const response = await axios.get(`${BASE_PATH}/config`);
    return response.data;
  } catch (error) {
    console.error('Erreur getConfigs:', error);
    return { configs: [] };
  }
};

export const createConfig = async (configData) => {
  try {
    const response = await axios.post(`${BASE_PATH}/config`, configData);
    return response.data;
  } catch (error) {
    console.error('Erreur createConfig:', error);
    throw error;
  }
};

export const updateConfig = async (configId, updateData) => {
  try {
    const response = await axios.put(`${BASE_PATH}/config/${configId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Erreur updateConfig:', error);
    throw error;
  }
};

export const deleteConfig = async (configId) => {
  try {
    const response = await axios.delete(`${BASE_PATH}/config/${configId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur deleteConfig:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================

export const getSettings = async () => {
  try {
    const response = await axios.get(`${BASE_PATH}/settings`);
    return response.data;
  } catch (error) {
    console.error('Erreur getSettings:', error);
    return { module_active: true, reward_expiration_days: 7 };
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await axios.put(`${BASE_PATH}/settings`, settings);
    return response.data;
  } catch (error) {
    console.error('Erreur updateSettings:', error);
    throw error;
  }
};

// ==================== RÉCOMPENSES ====================

export const getAllRewards = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axios.get(`${BASE_PATH}/rewards`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur getAllRewards:', error);
    return { rewards: [] };
  }
};

export default {
  getStats,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getSettings,
  updateSettings,
  getAllRewards
};
