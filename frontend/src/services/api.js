import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-native-reboot.preview.emergentagent.com';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
};

// Categories
export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// Options
export const optionsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching options:', error);
      throw error;
    }
  },
};

// Orders
export const ordersAPI = {
  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
};

// Users / Loyalty
export const usersAPI = {
  getLoyaltyPoints: async (email) => {
    try {
      const response = await api.get(`/users/${email}/loyalty`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      throw error;
    }
  },
};

export default api;
