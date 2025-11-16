import { create } from 'zustand'
import { ordersAPI } from '../services/api'

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  createOrder: async (orderData) => {
    set({ loading: true, error: null })
    
    try {
      console.log('📦 Creating order...', orderData)
      const response = await ordersAPI.create(orderData)
      const order = response.data
      
      set({ 
        currentOrder: order,
        orders: [order, ...get().orders],
        loading: false 
      })
      
      console.log('✅ Order created:', order.id)
      return { success: true, order }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la création de la commande'
      set({ error: errorMessage, loading: false })
      console.error('❌ Error creating order:', errorMessage)
      return { success: false, error: errorMessage }
    }
  },
  
  fetchMyOrders: async () => {
    set({ loading: true, error: null })
    
    try {
      const response = await ordersAPI.getMyOrders()
      const orders = response.data
      
      set({ orders, loading: false })
      console.log(`✅ Fetched ${orders.length} orders`)
      return { success: true, orders }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erreur de chargement des commandes'
      set({ error: errorMessage, loading: false })
      console.error('❌ Error fetching orders:', errorMessage)
      return { success: false, error: errorMessage }
    }
  },
  
  clearCurrentOrder: () => set({ currentOrder: null }),
  
  clearError: () => set({ error: null }),
}))

export default useOrderStore
