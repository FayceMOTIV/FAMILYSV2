import { create } from 'zustand';

const useLoyaltyStore = create((set) => ({
  balance: 0,
  transactions: [],
  loyaltyPercentage: 5,
  
  setBalance: (balance) => set({ balance }),
  
  setTransactions: (transactions) => set({ transactions }),
  
  setLoyaltyPercentage: (percentage) => set({ loyaltyPercentage: percentage }),
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions]
  }))
}));

export default useLoyaltyStore;
