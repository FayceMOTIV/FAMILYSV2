import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

export const useRestaurantStatus = () => {
  const [status, setStatus] = useState({
    isPaused: false,
    noMoreOrdersToday: false,
    pauseReason: null,
    pauseUntil: null,
    loading: true
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/admin/pause/status`);
        setStatus({
          isPaused: response.data.is_paused,
          noMoreOrdersToday: response.data.no_more_orders_today,
          pauseReason: response.data.pause_reason,
          pauseUntil: response.data.pause_until,
          loading: false
        });
      } catch (error) {
        console.error('Error checking restaurant status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkStatus();
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const canOrder = !status.isPaused && !status.noMoreOrdersToday;

  return {
    ...status,
    canOrder
  };
};
