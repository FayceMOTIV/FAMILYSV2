import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API client
const API_BASE_URL = 'https://react-reborn.preview.emergentagent.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const authStorage = await AsyncStorage.getItem('auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
          console.log('🔑 Token added to request');
        }
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    
    if (error.response?.status === 401) {
      // Déconnexion automatique
      await AsyncStorage.removeItem('auth-storage');
      console.log('🚪 Logged out due to 401');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Services API
export const productsAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  getByCategory: (categoryId) => apiClient.get(`/products?category=${categoryId}`)
};

export const categoriesAPI = {
  getAll: () => apiClient.get('/categories')
};

export const cashbackAPI = {
  getSettings: () => apiClient.get('/cashback/settings'),
  getBalance: (customerId) => apiClient.get(`/cashback/balance/${customerId}`),
  preview: (previewData) => apiClient.post('/cashback/preview', previewData)
};

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  logout: () => apiClient.post('/auth/logout')
};

export const promotionsAPI = {
  getAll: () => apiClient.get('/admin/promotions'),
  getActive: () => apiClient.get('/admin/promotions?status=active')
};

export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getById: (orderId) => apiClient.get(`/orders/${orderId}`),
  getByCustomer: (email) => apiClient.get(`/orders/customer/${email}`),
  getMyOrders: () => apiClient.get('/orders/me')
};

export const usersAPI = {
  getMe: () => apiClient.get('/auth/me'),
  getProfile: () => apiClient.get('/users/me')
};
