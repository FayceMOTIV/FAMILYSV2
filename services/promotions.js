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

  // Vérifier un code promo (promo classique OU code Surprise du Jour)
  validatePromoCode: async (code, cartTotal) => {
    try {
      // Détecter si c'est un code Surprise du Jour (SDJ-XXXX)
      if (code && code.toUpperCase().startsWith('SDJ-')) {
        const response = await api.get('/surprise/validate-reward/' + code.toUpperCase());
        
        if (response.data.valid) {
          const reward = response.data.reward;
          
          // Calculer la réduction selon le type
          let discountAmount = 0;
          let discountType = 'fixed';
          
          if (reward.type === 'discount_percent') {
            discountAmount = (cartTotal * reward.value) / 100;
            discountType = 'percentage';
          } else if (reward.type === 'discount_amount') {
            discountAmount = reward.value;
            discountType = 'fixed';
          } else if (reward.type === 'cashback') {
            // Cashback = crédité sur fidélité, pas de réduction directe
            discountAmount = 0;
            discountType = 'cashback';
          } else if (reward.type === 'product') {
            // Produit gratuit - sera ajouté au panier séparément
            discountAmount = reward.value || 0;
            discountType = 'product';
          }
          
          return {
            valid: true,
            promo: {
              code: code.toUpperCase(),
              name: reward.label || 'Surprise du Jour',
              type: 'surprise_du_jour',
              reward_type: reward.type,
              discount_type: discountType,
              discount_value: reward.value,
              product_id: reward.product_id,
              product_name: reward.product_name,
            },
            discount_amount: Math.min(discountAmount, cartTotal),
            is_surprise: true,
            is_cashback: reward.type === 'cashback',
            cashback_amount: reward.type === 'cashback' ? reward.value : 0
          };
        } else {
          return {
            valid: false,
            error: response.data.message || 'Code Surprise du Jour invalide ou expiré'
          };
        }
      }
      
      // Code promo classique
      const response = await api.post('/promotions/validate?code=' + encodeURIComponent(code) + '&cart_total=' + cartTotal);
      return response.data;
    } catch (error) {
      console.error('Erreur validatePromoCode:', error);
      return { valid: false, error: 'Erreur de validation du code promo' };
    }
  },

  // Marquer un code Surprise du Jour comme utilisé
  useSurpriseReward: async (code, orderId) => {
    try {
      if (code && code.toUpperCase().startsWith('SDJ-')) {
        const response = await api.post('/surprise/use-reward/' + code.toUpperCase() + '?order_id=' + orderId);
        return response.data;
      }
      return { success: true };
    } catch (error) {
      console.error('Erreur useSurpriseReward:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer les bannières promo
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
      const response = await api.get('/promotions/category/' + encodeURIComponent(category));
      return response.data;
    } catch (error) {
      console.error('Erreur getPromotionsByCategory:', error);
      return { promotions: [], count: 0 };
    }
  },

  // Récupérer promotions pour un produit
  getPromotionsByProduct: async (productId) => {
    try {
      const response = await api.get('/promotions/product/' + encodeURIComponent(productId));
      return response.data;
    } catch (error) {
      console.error('Erreur getPromotionsByProduct:', error);
      return { promotions: [], count: 0 };
    }
  }
};

export default promotionsService;
