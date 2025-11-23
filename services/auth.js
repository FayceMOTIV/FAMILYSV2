import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const login = async (email, password) => {
  const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
  return response.data;
};

export const register = async (email, password, name, phone) => {
  const response = await api.post(API_ENDPOINTS.REGISTER, { 
    email, 
    password, 
    name, 
    phone 
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(API_ENDPOINTS.ME);
  return response.data;
};
