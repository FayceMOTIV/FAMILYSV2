// Configuration API - URL mise à jour
export const API_BASE_URL = 'https://mobile-app-rebuild.preview.emergentagent.com/api/v1';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  
  // Produits
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  CATEGORIES: '/categories',
  
  // Panier & Commandes
  ORDERS: '/orders',
  ORDER_DETAIL: (id) => `/orders/${id}`,
  
  // Fidélité
  CASHBACK: '/cashback',
  CASHBACK_BALANCE: '/cashback/balance',
  CASHBACK_HISTORY: '/cashback/history',
  
  // Surprise du Jour
  SURPRISE_STATUS: '/surprise-du-jour/status',
  SURPRISE_PLAY: '/surprise-du-jour/play',
  SURPRISE_REWARDS: '/surprise-du-jour/rewards',
  SURPRISE_CLAIM: '/surprise-du-jour/claim',
};
