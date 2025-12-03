import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurant/info`);
      set({ settings: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Helpers
  isDeliveryEnabled: () => get().settings?.enable_delivery || false,
  isTakeawayEnabled: () => get().settings?.enable_takeaway || false,
  isOnsiteEnabled: () => get().settings?.enable_onsite || false,
  isReservationsEnabled: () => get().settings?.enable_reservations || false,
  isPaused: () => get().settings?.is_paused || false,
  getOrderCutoffMinutes: () => get().settings?.order_cutoff_minutes || 20,
  getPreparationTime: () => get().settings?.preparation_time_minutes || 15,
}));
