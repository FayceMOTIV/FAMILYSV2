import api from './api';

export const getLoyalty = async () => {
  const response = await api.get('/loyalty');
  return response.data;
};

export const getLoyaltyHistory = async (skip = 0, limit = 20) => {
  const response = await api.get('/loyalty/history', { params: { skip, limit } });
  return response.data;
};
