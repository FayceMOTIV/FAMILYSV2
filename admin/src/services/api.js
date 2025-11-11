import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/backoffice/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const productsAPI = {
  getAll: (category) => api.get('/products', { params: { category } }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  getAll: (filters) => api.get('/orders', { params: filters }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getSummary: () => api.get('/orders/stats/summary'),
};

// Phase 2 APIs
export const aiAPI = {
  generateMarketing: (data) => api.post('/ai/generate-marketing', data),
  analyzeSales: () => api.get('/ai/analyze-sales'),
  chat: (question) => api.post('/ai/chat', { question }),
  suggestPromo: () => api.get('/ai/suggest-promo'),
};

export const promosAPI = {
  getAll: () => api.get('/promos'),
  create: (data) => api.post('/promos', data),
  update: (id, data) => api.put(`/promos/${id}`, data),
  delete: (id) => api.delete(`/promos/${id}`),
};

export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  getSegments: () => api.get('/customers/stats/segments'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  send: (id) => api.post(`/notifications/${id}/send`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reservationsAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  create: (data) => api.post('/reservations', data),
  updateStatus: (id, data) => api.patch(`/reservations/${id}/status`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
