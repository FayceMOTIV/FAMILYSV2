import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useFavoriteStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      
      toggleFavorite: (product) => {
        const favorites = get().favorites
        const existingIndex = favorites.findIndex((fav) => fav.id === product.id)
        
        if (existingIndex !== -1) {
          // Remove from favorites
          const newFavorites = favorites.filter((fav) => fav.id !== product.id)
          set({ favorites: newFavorites })
          console.log('💔 Removed from favorites:', product.name)
          return false
        } else {
          // Add to favorites
          set({ favorites: [...favorites, product] })
          console.log('❤️ Added to favorites:', product.name)
          return true
        }
      },
      
      isFavorite: (productId) => {
        return get().favorites.some((fav) => fav.id === productId)
      },
      
      clearFavorites: () => {
        set({ favorites: [] })
        console.log('🗑️ Favorites cleared')
      },
      
      getFavoriteCount: () => {
        return get().favorites.length
      },
    }),
    {
      name: 'favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useFavoriteStore
