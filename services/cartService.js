import api from './api';

export const cartService = {
  /**
   * Calcule toutes les promotions applicables au panier
   */
  calculatePromotions: async (items, customerEmail = null, promoCode = null) => {
    try {
      const response = await api.post('/cart/calculate', {
        items: items.map(item => ({
          id: item.id || item.product_id,
          product_id: item.id || item.product_id,
          name: item.name,
          price: item.original_price || item.base_price || item.price || 0,
          base_price: item.base_price || item.price || 0,
          quantity: item.quantity || 1,
          category: item.category || item.category_id,
          category_id: item.category || item.category_id,
        })),
        customer_email: customerEmail,
        promo_code: promoCode
      });
      return response.data;
    } catch (error) {
      console.error('Erreur calcul promotions:', error);
      return {
        success: false,
        cart_total: 0,
        promotions_applied: [],
        total_discount: 0,
        final_total: 0,
        suggestions: []
      };
    }
  },

  /**
   * Récupère les promos actives pour affichage
   */
  getActivePromos: async () => {
    try {
      const response = await api.get('/cart/active-promos');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération promos:', error);
      return { promotions: [], count: 0 };
    }
  }
};

export default cartService;
