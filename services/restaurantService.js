
import { API_BASE_URL } from '../constants/config';

export const getRestaurantInfo = async () => {

try {

const response = await fetch(`${API_BASE_URL}/restaurant/info`);

if (!response.ok) throw new Error('Erreur lors du chargement des informations');

const data = await response.json();

return data;

} catch (error) {

console.error('Erreur getRestaurantInfo:', error);

return {

name: "Family's",

phone: "+33 1 42 34 56 78",

email: "contact@familys.fr",

address: "123 Rue de la Gastronomie",

city: "Paris",

postal_code: "75001",

latitude: 48.8566,

longitude: 2.3522,

logo_url: null,

opening_hours: {

monday: { closed: false, open: "11:00", close: "22:30" },

tuesday: { closed: false, open: "11:00", close: "22:30" },

wednesday: { closed: false, open: "11:00", close: "22:30" },

thursday: { closed: false, open: "11:00", close: "22:30" },

friday: { closed: false, open: "11:00", close: "22:30" },

saturday: { closed: false, open: "11:00", close: "23:00" },

sunday: { closed: false, open: "12:00", close: "22:00" }

},

social_media: {

facebook: "https://facebook.com/familys",

instagram: "https://instagram.com/familys",

twitter: "https://twitter.com/familys"

}

};

}

};

