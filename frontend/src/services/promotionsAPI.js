import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://admin-kitchen.preview.emergentagent.com';

export const promotionsAPI = {
  // Get all active promotions
  getActive: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions`, {
        params: { status_filter: 'active' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  },

  // Get promotions for specific products
  getForProducts: async (productIds) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions`);
      const allPromos = response.data.promotions || [];
      
      // Filter promotions that apply to these products
      return allPromos.filter(promo => {
        if (!promo.is_active || promo.status !== 'active') return false;
        
        // Check if promotion applies to any of the products
        return productIds.some(productId => 
          promo.eligible_products?.includes(productId) ||
          promo.eligible_categories?.length > 0 // Will check category later
        );
      });
    } catch (error) {
      console.error('Error fetching product promotions:', error);
      return [];
    }
  },

  // Simulate promotions on a cart
  simulate: async (cart, customer = null, promoCode = null) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/admin/promotions/simulate`, {
        cart,
        customer,
        promo_code: promoCode
      });
      return response.data.simulation;
    } catch (error) {
      console.error('Error simulating promotions:', error);
      throw error;
    }
  },

  // Get banner promotions (for home page)
  getBanners: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions`);
      const allPromos = response.data.promotions || [];
      
      // Filter active promotions that have banner_text or banner_image
      return allPromos.filter(promo => 
        promo.is_active && 
        promo.status === 'active' &&
        (promo.banner_text || promo.banner_image)
      );
    } catch (error) {
      console.error('Error fetching banner promotions:', error);
      return [];
    }
  }
};
