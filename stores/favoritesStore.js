import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  
  // Initialize favorites from AsyncStorage
  initFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        set({ favorites: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Init favorites error:', error);
    }
  },
  
  // Toggle favorite
  toggleFavorite: async (productId) => {
    const favorites = get().favorites;
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    set({ favorites: newFavorites });
    
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Save favorites error:', error);
    }
  },
  
  // Check if product is favorite
  isFavorite: (productId) => {
    return get().favorites.includes(productId);
  },
  
  // Get favorites count
  getFavoritesCount: () => {
    return get().favorites.length;
  },
  
  // Clear all favorites
  clearFavorites: async () => {
    set({ favorites: [] });
    try {
      await AsyncStorage.removeItem('favorites');
    } catch (error) {
      console.error('Clear favorites error:', error);
    }
  },
}));
