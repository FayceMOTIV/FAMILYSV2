import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, quantity = 1, options = null) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      item => item.product.id === product.id && 
              JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      set({ items: newItems });
    } else {
      set({ items: [...items, { product, quantity, options }] });
    }
  },

  removeItem: (productId, options = null) => {
    const { items } = get();
    set({
      items: items.filter(
        item => !(item.product.id === productId && 
                  JSON.stringify(item.options) === JSON.stringify(options))
      )
    });
  },

  updateQuantity: (productId, quantity, options = null) => {
    const { items } = get();
    const newItems = items.map(item => {
      if (item.product.id === productId && 
          JSON.stringify(item.options) === JSON.stringify(options)) {
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    set({ items: newItems });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
