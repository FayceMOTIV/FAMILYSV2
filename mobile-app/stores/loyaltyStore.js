import { create } from 'zustand'
import { cashbackAPI } from '../services/api'

const useLoyaltyStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  loyaltyPercentage: 5,
  loading: false,
  error: null,
  
  fetchBalance: async (customerId) => {
    set({ loading: true, error: null })
    try {
      const response = await cashbackAPI.getBalance(customerId)
      const { balance } = response.data
      
      set({ balance, loading: false })
      console.log('💰 Loyalty balance fetched:', balance)
      
      return { success: true, balance }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erreur de chargement du solde'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },
  
  fetchSettings: async () => {
    try {
      const response = await cashbackAPI.getSettings()
      const { loyalty_percentage } = response.data
      
      set({ loyaltyPercentage: loyalty_percentage })
      console.log('⚙️ Loyalty settings fetched:', loyalty_percentage + '%')
    } catch (error) {
      console.error('Error fetching loyalty settings:', error)
    }
  },
  
  setBalance: (balance) => set({ balance }),
  
  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions]
  })),
  
  clearError: () => set({ error: null }),
}));

export default useLoyaltyStore
