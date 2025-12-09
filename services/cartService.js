import api from './api';

export const cartService = {
  /**
   * Calcule les promotions PANIER (seuils, codes promo, BOGO)
   * NOTE: Les promos produits individuels sont déjà appliquées via promo_price
   */
  calculatePromotions: async (items, customerEmail = null, promoCode = null) => {
    try {
      const response = await api.post('/cart/calculate', {
        items: items.map(item => ({
          id: item.id || item.product_id,
          product_id: item.id || item.product_id,
          name: item.name,
          // IMPORTANT: Envoyer le prix EFFECTIF (déjà avec promo produit)
          price: item.price || item.promo_price || item.base_price || 0,
          // Prix original pour calcul des économies
          base_price: item.base_price || item.original_price || item.price || 0,
          original_price: item.original_price || item.base_price || item.price || 0,
          quantity: item.quantity || 1,
          category: item.category || item.category_id,
          category_id: item.category || item.category_id,
          // Indiquer si promo déjà appliquée
          has_promo: !!(item.promo_price && item.promo_price < (item.base_price || item.price)),
          promo_badge: item.promo_badge || null,
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
   * Récupère les promos panier actives pour affichage
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
