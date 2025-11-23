import api from './api';

export const getSurpriseStatus = async () => {
  const response = await api.get('/surprise/status');
  return response.data;
};

export const playSurprise = async () => {
  const response = await api.post('/surprise/play');
  return response.data;
};

export const claimReward = async (playId) => {
  const response = await api.post(`/surprise/claim/${playId}`);
  return response.data;
};

export const getMyRewards = async () => {
  const response = await api.get('/surprise/rewards');
  return response.data;
};
