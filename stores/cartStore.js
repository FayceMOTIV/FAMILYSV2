import { create } from 'zustand';
import { cartService } from '../services/cartService';

export const useCartStore = create((set, get) => ({
  items: [],
  promoCode: null,
  appliedPromotions: [],
  totalDiscount: 0,
  suggestions: [],
  loyaltyMultiplier: 1.0,
  isCalculating: false,

  // Initialize cart
  initCart: async () => {
    set({ items: [], appliedPromotions: [], totalDiscount: 0, suggestions: [] });
  },

  // Add item to cart
  addItem: (item) => {
    const items = get().items;
    
    const effectivePrice = item.promo_price || item.price || item.base_price || 0;
    
    const normalizedItem = {
      ...item,
      price: effectivePrice,
      original_price: item.base_price || item.price || effectivePrice,
      base_price: item.base_price || item.price || effectivePrice,
      has_promo: !!(item.promo_price && item.promo_price < (item.base_price || item.price)),
      promo_badge: item.promo_badge || null,
      quantity: item.quantity || 1,
      id: item.id || item.product_id || Date.now().toString(),
      category: item.category || item.category_id || null,
    };
    
    const newItems = [...items, normalizedItem];
    set({ items: newItems });
    
    // Recalculer les promos
    get().recalculatePromotions();
  },

  // Remove item
  removeItem: (itemId) => {
    const items = get().items;
    const indexToRemove = items.findIndex(item => 
      (item.id || item.product_id) === itemId
    );
    
    if (indexToRemove === -1) return;
    
    const newItems = items.filter((_, i) => i !== indexToRemove);
    set({ items: newItems });
    
    get().recalculatePromotions();
  },

  // Update quantity
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    
    const items = get().items;
    const newItems = items.map((item) => {
      if ((item.id || item.product_id) === itemId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    set({ items: newItems });
    get().recalculatePromotions();
  },

  // Set promo code
  setPromoCode: (code) => {
    set({ promoCode: code });
    get().recalculatePromotions();
  },

  // Clear promo code
  clearPromoCode: () => {
    set({ promoCode: null });
    get().recalculatePromotions();
  },

  // Recalculate all promotions via API
  recalculatePromotions: async (customerEmail = null) => {
    const { items, promoCode } = get();
    
    if (!items || items.length === 0) {
      set({ 
        appliedPromotions: [], 
        totalDiscount: 0, 
        suggestions: [],
        loyaltyMultiplier: 1.0 
      });
      return;
    }

    set({ isCalculating: true });

    try {
      const result = await cartService.calculatePromotions(items, customerEmail, promoCode);
      
      if (result.success) {
        set({
          appliedPromotions: result.promotions_applied || [],
          totalDiscount: result.total_discount || 0,
          suggestions: result.suggestions || [],
          loyaltyMultiplier: result.loyalty_multiplier || 1.0,
        });
      }
    } catch (error) {
      console.error('Erreur recalcul promos:', error);
    } finally {
      set({ isCalculating: false });
    }
  },

  // Clear cart
  clearCart: () => {
    set({ 
      items: [], 
      promoCode: null,
      appliedPromotions: [], 
      totalDiscount: 0, 
      suggestions: [],
      loyaltyMultiplier: 1.0 
    });
  },

  // Get subtotal (prix avec promos produits individuels, avant promos panier)
  getSubtotal: () => {
    const items = get().items;
    if (!items || items.length === 0) return 0;
    
    return items.reduce((sum, item) => {
      const price = item.price || item.base_price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  },

  // Get total without any promos
  getTotalWithoutPromos: () => {
    const items = get().items;
    if (!items || items.length === 0) return 0;
    
    return items.reduce((sum, item) => {
      const originalPrice = item.original_price || item.base_price || item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (originalPrice * quantity);
    }, 0);
  },

  // Get product-level promo savings (prix barré sur produits)
  getProductPromoSavings: () => {
    const subtotal = get().getSubtotal();
    const originalTotal = get().getTotalWithoutPromos();
    return Math.max(0, originalTotal - subtotal);
  },

  // Get cart-level promo discount (BOGO, threshold, etc.)
  getCartPromoDiscount: () => {
    return get().totalDiscount || 0;
  },

  // Get total (final price)
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const cartDiscount = get().getCartPromoDiscount();
    return Math.max(0, subtotal - cartDiscount);
  },

  // Get all savings combined
  getTotalSavings: () => {
    const productSavings = get().getProductPromoSavings();
    const cartDiscount = get().getCartPromoDiscount();
    return productSavings + cartDiscount;
  },

  // Legacy: getPromoSavings for compatibility
  getPromoSavings: () => {
    return get().getProductPromoSavings();
  },

  // Get item count
  getItemCount: () => {
    const items = get().items;
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  // Get applied promotions
  getAppliedPromotions: () => {
    return get().appliedPromotions || [];
  },

  // Get suggestions
  getSuggestions: () => {
    return get().suggestions || [];
  },
}));
