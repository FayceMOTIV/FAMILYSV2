import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// API Firebase (nouvelle)
const firebaseApi = axios.create({
  baseURL: `${API_URL}/api/v1/fb`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Admin (ancienne - pour AI, auth, etc.)
const adminApi = axios.create({
  baseURL: `${API_URL}/api/v1/fb`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// AUTH (reste sur admin)
// ============================================
export const authAPI = {
  login: (email, password) => adminApi.post('/auth/login', { email, password }),
  register: (data) => adminApi.post('/auth/register', data),
};

// ============================================
// DASHBOARD (reste sur admin)
// ============================================
export const dashboardAPI = {
  getStats: () => firebaseApi.get('/dashboard/stats'),
  getSimple: () => firebaseApi.get('/dashboard/simple'),
};

// ============================================
// CATEGORIES (Firebase)
// ============================================
export const categoriesAPI = {
  getAll: () => firebaseApi.get('/categories'),
  getOne: (id) => firebaseApi.get('/categories/' + id),
  create: (data) => firebaseApi.post('/categories', data),
  update: (id, data) => firebaseApi.put('/categories/' + id, data),
  delete: (id) => firebaseApi.delete('/categories/' + id),
  reorder: (orders) => firebaseApi.post('/categories/reorder', orders),
};

// ============================================
// PRODUCTS (Firebase)
// ============================================
export const productsAPI = {
  getAll: (category_id) => firebaseApi.get('/products', { params: { category_id } }),
  getOne: (id) => firebaseApi.get('/products/' + id),
  create: (data) => firebaseApi.post('/products', data),
  update: (id, data) => firebaseApi.put('/products/' + id, data),
  delete: (id) => firebaseApi.delete('/products/' + id),
  toggleStock: (id, is_out_of_stock) => firebaseApi.patch('/products/' + id + '/stock', null, { params: { is_out_of_stock } }),
  toggleAvailability: (id, is_available) => firebaseApi.patch('/products/' + id + '/availability', null, { params: { is_available } }),
};

// ============================================
// OPTIONS (Firebase)
// ============================================
export const optionsAPI = {
  getAll: () => firebaseApi.get('/options'),
  getById: (id) => firebaseApi.get('/options/' + id),
  create: (data) => firebaseApi.post('/options', data),
  update: (id, data) => firebaseApi.put('/options/' + id, data),
  delete: (id) => firebaseApi.delete('/options/' + id),
  reorder: (orders) => firebaseApi.post('/options/reorder', orders),
};

// ============================================
// PROMOTIONS (Firebase)
// ============================================
export const promotionsAPI = {
  getAll: (active_only) => firebaseApi.get('/promotions', { params: { active_only } }),
  getActive: () => firebaseApi.get('/promotions/active'),
  getOne: (id) => firebaseApi.get('/promotions/' + id),
  create: (data) => firebaseApi.post('/promotions', data),
  update: (id, data) => firebaseApi.put('/promotions/' + id, data),
  delete: (id) => firebaseApi.delete('/promotions/' + id),
  toggle: (id, is_active) => firebaseApi.patch('/promotions/' + id + '/toggle', null, { params: { is_active } }),
};

// Alias pour compatibilité
export const promosAPI = promotionsAPI;

// ============================================
// ORDERS (Firebase)
// ============================================
export const ordersAPI = {
  getAll: (status) => firebaseApi.get('/orders', { params: { status } }),
  getActive: () => firebaseApi.get('/orders/active'),
  getToday: () => firebaseApi.get('/orders/today'),
  getOne: (id) => firebaseApi.get('/orders/' + id),
  updateStatus: (id, status) => firebaseApi.patch('/orders/' + id + '/status', { status }),
  update: (id, data) => firebaseApi.patch('/orders/' + id, data),
  create: (data) => firebaseApi.post('/orders', data),
  cancel: (id, reason) => firebaseApi.post('/orders/' + id + '/cancel', null, { params: { reason } }),
  getStats: () => firebaseApi.get('/orders/stats/today'),
  getSummary: () => firebaseApi.get('/orders/stats/today'),
};

// ============================================
// CUSTOMERS (Firebase)
// ============================================
export const customersAPI = {
  getAll: (limit) => firebaseApi.get('/customers', { params: { limit } }),
  getOne: (id) => firebaseApi.get('/customers/' + id),
  update: (id, data) => firebaseApi.put('/customers/' + id, data),
  getOrders: (id, limit) => firebaseApi.get('/customers/' + id + '/orders', { params: { limit } }),
  getLoyalty: (id) => firebaseApi.get('/customers/' + id + '/loyalty'),
  addLoyalty: (id, data) => firebaseApi.post('/customers/' + id + '/loyalty', data),
};

// ============================================
// SETTINGS (Firebase)
// ============================================
export const settingsAPI = {
  get: () => firebaseApi.get('/settings'),
  update: (data) => firebaseApi.put('/settings', data),
};

// ============================================
// POPUPS (Firebase)
// ============================================
export const popupsAPI = {
  getAll: () => firebaseApi.get('/popups'),
  getActive: () => firebaseApi.get('/popups/active'),
  getOne: (id) => firebaseApi.get('/popups/' + id),
  create: (data) => firebaseApi.post('/popups', data),
  update: (id, data) => firebaseApi.put('/popups/' + id, data),
  delete: (id) => firebaseApi.delete('/popups/' + id),
  toggle: (id, is_active) => firebaseApi.patch('/popups/' + id + '/toggle', null, { params: { is_active } }),
};

// ============================================
// UPLOAD (Firebase Storage)
// ============================================
export const uploadAPI = {
  image: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    return firebaseApi.post('/upload/image', formData, {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  productImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return firebaseApi.post('/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  categoryImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return firebaseApi.post('/upload/category-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  popupImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return firebaseApi.post('/upload/popup-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  branding: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    return firebaseApi.post('/upload/branding', formData, {
      params: { type },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (path) => firebaseApi.delete('/upload', { params: { path } }),
};

// ============================================
// AI (reste sur admin)
// ============================================
export const aiAPI = {
  generateMarketing: (data) => firebaseApi.post('/ai/generate-marketing', data),
  analyzeSales: () => firebaseApi.get('/ai/analyze-sales'),
  chat: (question) => firebaseApi.post('/ai/chat', { question }),
  suggestPromo: () => firebaseApi.get('/ai/suggest-promo'),
};

// ============================================
// NOTIFICATIONS (reste sur admin)
// ============================================
export const notificationsAPI = {
  getAll: () => firebaseApi.get('/notifications'),
  create: (data) => firebaseApi.post('/notifications', data),
  send: (id) => firebaseApi.post('/notifications/' + id + '/send'),
  delete: (id) => firebaseApi.delete('/notifications/' + id),
};

// ============================================
// RESERVATIONS (reste sur admin)
// ============================================
export const reservationsAPI = {
  getAll: (params) => adminApi.get('/reservations', { params }),
  create: (data) => adminApi.post('/reservations', data),
  updateStatus: (id, data) => adminApi.patch('/reservations/' + id + '/status', data),
  delete: (id) => adminApi.delete('/reservations/' + id),
};

// ============================================
// SURPRISE DU JOUR (Firebase)
// ============================================
export const surpriseAPI = {
  getConfig: () => firebaseApi.get('/surprise/config'),
  updateConfig: (data) => firebaseApi.put('/surprise/config', data),
  getRewards: () => firebaseApi.get('/surprise/rewards'),
  createReward: (data) => firebaseApi.post('/surprise/rewards', data),
  updateReward: (id, data) => firebaseApi.put('/surprise/rewards/' + id, data),
  deleteReward: (id) => firebaseApi.delete('/surprise/rewards/' + id),
  getStats: () => firebaseApi.get('/surprise/stats'),
  play: (customerId) => firebaseApi.post('/surprise/play', { customer_id: customerId }),
};

// Export default
export default firebaseApi;

// ============================================
// CHOICE LIBRARY (Firebase)
// ============================================
export const choiceLibraryAPI = {
  getAll: (category) => firebaseApi.get('/choice-library', { params: { category } }),
  getCategories: () => firebaseApi.get('/choice-library/categories'),
  getById: (id) => firebaseApi.get('/choice-library/' + id),
  create: (data) => firebaseApi.post('/choice-library', data),
  update: (id, data) => firebaseApi.put('/choice-library/' + id, data),
  delete: (id) => firebaseApi.delete('/choice-library/' + id),
  createBulk: (choices) => firebaseApi.post('/choice-library/bulk', choices),
};
