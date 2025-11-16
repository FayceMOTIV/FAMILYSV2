import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter(i => i.id !== itemId)
  })),
  
  updateQuantity: (itemId, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === itemId ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [], total: 0 }),
  
  calculateTotal: () => {
    const items = get().items;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ total });
  }
}));

export default useCartStore;
