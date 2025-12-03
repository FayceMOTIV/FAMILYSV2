import api from './api';

export const reservationsService = {
  // Créer une réservation
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  // Récupérer les réservations d'un client
  getCustomerReservations: async (customerEmail) => {
    const response = await api.get(`/reservations/customer/${customerEmail}`);
    return response.data;
  },

  // Annuler une réservation
  cancelReservation: async (reservationId) => {
    const response = await api.delete(`/reservations/${reservationId}`);
    return response.data;
  },
};

export default reservationsService;
