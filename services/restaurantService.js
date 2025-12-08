import { API_BASE_URL } from '../constants/config';

export const getRestaurantInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Erreur lors du chargement des informations');
    const data = await response.json();
    
    // Mapper les données depuis settings
    const settings = data.settings || data;
    return {
      name: settings.name || "Family's",
      phone: settings.phone || "",
      email: settings.email || "",
      address: settings.address || "",
      city: settings.city || "",
      postal_code: settings.postal_code || "",
      latitude: settings.latitude || null,
      longitude: settings.longitude || null,
      logo_url: settings.logo_url || settings.hero_image_url || null,
      opening_hours: settings.opening_hours || {},
      social_media: settings.social_media || {}
    };
  } catch (error) {
    console.error('Erreur getRestaurantInfo:', error);
    // Fallback en cas d'erreur
    return {
      name: "Family's",
      phone: "",
      email: "",
      address: "",
      city: "",
      postal_code: "",
      latitude: null,
      longitude: null,
      logo_url: null,
      opening_hours: {},
      social_media: {}
    };
  }
};
