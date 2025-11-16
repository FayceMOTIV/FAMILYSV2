import axios from 'axios';

// Configuration de l'API client
const API_BASE_URL = 'https://react-native-reboot.preview.emergentagent.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token du store Zustand si disponible
    // const token = useAuthStore.getState().token;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion automatique
      // useAuthStore.getState().logout();
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

export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getByCustomer: (email) => apiClient.get(`/orders/customer/${email}`)
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
