import api from './api';

export const promotionsService = {
  // Récupérer toutes les promotions actives
  getActivePromotions: async () => {
    try {
      const response = await api.get('/promotions/active');
      return response.data;
    } catch (error) {
      console.error('Erreur getActivePromotions:', error);
      return { promotions: [], count: 0 };
    }
  },

  // Vérifier un code promo
  validatePromoCode: async (code, cartTotal) => {
    try {
      const response = await api.post(`/promotions/validate?code=${encodeURIComponent(code)}&cart_total=${cartTotal}`);
      return response.data;
    } catch (error) {
      console.error('Erreur validatePromoCode:', error);
      return { valid: false, error: 'Erreur de validation du code promo' };
    }
  },

  // Récupérer les bannières promo (pour slider accueil)
  getPromoBanners: async () => {
    try {
      const response = await api.get('/promotions/banners');
      return response.data;
    } catch (error) {
      console.error('Erreur getPromoBanners:', error);
      return { banners: [] };
    }
  },

  // Récupérer promotions pour une catégorie
  getPromotionsByCategory: async (category) => {
    try {
      const response = await api.get(`/promotions/category/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getPromotionsByCategory:', error);
      return { promotions: [], count: 0 };
    }
  },

  // Récupérer promotions pour un produit
  getPromotionsByProduct: async (productId) => {
    try {
      const response = await api.get(`/promotions/product/${encodeURIComponent(productId)}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getPromotionsByProduct:', error);
      return { promotions: [], count: 0 };
    }
  }
};

export default promotionsService;
