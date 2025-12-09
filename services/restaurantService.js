import { API_BASE_URL } from '../constants/config';

export const getRestaurantInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Erreur lors du chargement des informations');
    const data = await response.json();
    
    // Mapper les données depuis settings
    const settings = data.settings || data;
    
    // Convertir le format des horaires Firebase vers le format app
    const convertedHours = {};
    if (settings.opening_hours) {
      const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      daysOrder.forEach(day => {
        const hours = settings.opening_hours[day];
        if (hours) {
          if (hours.closed) {
            convertedHours[day] = { closed: true };
          } else {
            // Format avec 2 services (open1/close1, open2/close2)
            if (hours.open1 && hours.close1) {
              if (hours.open2 && hours.close2) {
                // 2 services : afficher les deux
                convertedHours[day] = {
                  open: hours.open1,
                  close: hours.close2,
                  details: `${hours.open1}-${hours.close1} / ${hours.open2}-${hours.close2}`
                };
              } else {
                // 1 seul service
                convertedHours[day] = {
                  open: hours.open1,
                  close: hours.close1
                };
              }
            }
            // Format simple (open/close)
            else if (hours.open && hours.close) {
              convertedHours[day] = {
                open: hours.open,
                close: hours.close
              };
            }
          }
        }
      });
    }
    
    return {
      name: settings.name || "Family's",
      phone: settings.phone || "",
      email: settings.email || "",
      address: settings.address || "",
      city: settings.city || "",
      postal_code: settings.postal_code || "",
      latitude: settings.latitude || null,
      longitude: settings.longitude || null,
      logo_url: settings.logo_url || settings.home_hero_image || null,
      opening_hours: convertedHours,
      social_media: settings.social_media || {}
    };
  } catch (error) {
    console.error('Erreur getRestaurantInfo:', error);
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
