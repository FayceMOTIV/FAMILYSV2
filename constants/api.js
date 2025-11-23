// API Configuration
export const API_BASE_URL = 'https://api-overhaul-2.preview.emergentagent.com/api/v1';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  CATEGORIES: '/categories',
  
  // Cart & Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id) => `/orders/${id}`,
  
  // Loyalty
  CASHBACK: '/cashback',
  CASHBACK_BALANCE: '/cashback/balance',
  CASHBACK_HISTORY: '/cashback/history',
  
  // Surprise du Jour
  SURPRISE_STATUS: '/surprise-du-jour/status',
  SURPRISE_PLAY: '/surprise-du-jour/play',
  SURPRISE_REWARDS: '/surprise-du-jour/rewards',
  SURPRISE_CLAIM: '/surprise-du-jour/claim',
};
