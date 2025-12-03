import axios from 'axios';
import { API_URL } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple interceptor without AsyncStorage (for Expo Go compatibility)
// Token will be managed by Zustand store
api.interceptors.request.use(
  async (config) => {
    // Token can be set manually when needed
    // Example: api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - will be managed by calling code
      console.log('Unauthorized - please login again');
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper functions
export const apiGet = (url, params) => api.get(url, { params });
export const apiPost = (url, data) => api.post(url, data);
export const apiPut = (url, data) => api.put(url, data);
export const apiDelete = (url) => api.delete(url);
