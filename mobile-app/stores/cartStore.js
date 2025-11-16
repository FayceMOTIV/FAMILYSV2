import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, options = []) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          (item) => item.id === product.id && JSON.stringify(item.options) === JSON.stringify(options)
        )
        
        if (existingItemIndex !== -1) {
          // Item exists, increment quantity
          const newItems = [...items]
          newItems[existingItemIndex].quantity += 1
          set({ items: newItems })
        } else {
          // New item
          set({ 
            items: [...items, { 
              ...product, 
              quantity: 1, 
              options 
            }] 
          })
        }
        
        console.log('✅ Item added to cart:', product.name)
      },
      
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
        console.log('❌ Item removed from cart')
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        const items = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
        set({ items })
      },
      
      incrementQuantity: (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (item) {
          get().updateQuantity(itemId, item.quantity + 1)
        }
      },
      
      decrementQuantity: (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (item) {
          get().updateQuantity(itemId, item.quantity - 1)
        }
      },
      
      clearCart: () => {
        set({ items: [] })
        console.log('🗑️ Cart cleared')
      },
      
      // Computed values
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },
      
      getTax: () => {
        const subtotal = get().getSubtotal()
        return subtotal * 0.1 // 10% TVA
      },
      
      getTotal: () => {
        return get().getSubtotal() + get().getTax()
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      getCashbackEarned: (loyaltyRate = 0.05) => {
        return get().getSubtotal() * loyaltyRate
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useCartStore
