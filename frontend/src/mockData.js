// Mock data for Family's Restaurant App

export const products = [
  {
    id: 'burger-1',
    name: 'Le King',
    slug: 'le-king',
    category: 'burgers',
    description: 'Notre burger signature : double steak haché frais, cheddar fondant, bacon croustillant, oignons caramélisés, sauce maison',
    basePrice: 9.90,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    tags: ['best-seller', 'popular'],
    isAvailable: true
  },
  {
    id: 'burger-2',
    name: "Family's Classic",
    slug: 'familys-classic',
    category: 'burgers',
    description: 'Le classique revisité : steak haché 180g, cheddar, tomates fraîches, salade croquante, cornichons, sauce burger maison',
    basePrice: 7.90,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    tags: ['popular'],
    isAvailable: true
  },
  {
    id: 'burger-3',
    name: 'Smoky BBQ',
    slug: 'smoky-bbq',
    category: 'burgers',
    description: 'Steak haché fumé, cheddar, bacon, oignons frits croustillants, sauce BBQ fumée maison',
    basePrice: 8.90,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80',
    tags: ['new'],
    isAvailable: true
  },
  {
    id: 'burger-4',
    name: 'Chicken Crunch',
    slug: 'chicken-crunch',
    category: 'burgers',
    description: 'Poulet pané croustillant, emmental, salade iceberg, tomates, sauce caesar',
    basePrice: 7.50,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
    tags: [],
    isAvailable: true
  },
  {
    id: 'taco-1',
    name: 'Tacos Viande Hachée',
    slug: 'tacos-viande-hachee',
    category: 'tacos',
    description: 'Galette XXL, viande hachée épicée, fromage fondu, frites, sauce fromagère',
    basePrice: 8.50,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    tags: ['best-seller'],
    isAvailable: true
  },
  {
    id: 'taco-2',
    name: 'Tacos Poulet Crispy',
    slug: 'tacos-poulet-crispy',
    category: 'tacos',
    description: 'Galette XXL, poulet pané, fromage fondu, frites, sauce algérienne',
    basePrice: 8.50,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=800&q=80',
    tags: ['popular'],
    isAvailable: true
  },
  {
    id: 'menu-1',
    name: 'Menu King',
    slug: 'menu-king',
    category: 'menus',
    description: 'Le King + Frites maison + Boisson 50cl au choix',
    basePrice: 13.90,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
    tags: ['best-seller'],
    isAvailable: true
  },
  {
    id: 'menu-2',
    name: 'Menu Classic',
    slug: 'menu-classic',
    category: 'menus',
    description: "Family's Classic + Frites maison + Boisson 33cl au choix",
    basePrice: 10.90,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
    tags: ['popular'],
    isAvailable: true
  },
  {
    id: 'dessert-1',
    name: 'Tiramisu Nutella',
    slug: 'tiramisu-nutella',
    category: 'desserts',
    description: 'Tiramisu maison au Nutella, biscuits cuillère imbibés, mascarpone crémeux',
    basePrice: 4.50,
    vatRate: 5.5,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    tags: ['best-seller'],
    isAvailable: true
  },
  {
    id: 'dessert-2',
    name: 'Cheesecake Daim',
    slug: 'cheesecake-daim',
    category: 'desserts',
    description: 'Cheesecake crémeux avec éclats de Daim croquants, caramel au beurre salé',
    basePrice: 4.90,
    vatRate: 5.5,
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80',
    tags: ['new'],
    isAvailable: true
  },
  {
    id: 'dessert-3',
    name: 'Mousse Chocolat',
    slug: 'mousse-chocolat',
    category: 'desserts',
    description: 'Mousse au chocolat noir intense, chantilly maison',
    basePrice: 3.90,
    vatRate: 5.5,
    imageUrl: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800&q=80',
    tags: [],
    isAvailable: true
  },
  {
    id: 'drink-1',
    name: 'Coca-Cola 33cl',
    slug: 'coca-cola-33cl',
    category: 'boissons',
    description: 'Boisson gazeuse Coca-Cola 33cl',
    basePrice: 2.50,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
    tags: [],
    isAvailable: true
  },
  {
    id: 'drink-2',
    name: 'Coca-Cola 50cl',
    slug: 'coca-cola-50cl',
    category: 'boissons',
    description: 'Boisson gazeuse Coca-Cola 50cl',
    basePrice: 3.50,
    vatRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800&q=80',
    tags: [],
    isAvailable: true
  },
  {
    id: 'drink-3',
    name: 'Eau Minérale 50cl',
    slug: 'eau-minerale-50cl',
    category: 'boissons',
    description: 'Eau minérale naturelle 50cl',
    basePrice: 2.00,
    vatRate: 5.5,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
    tags: [],
    isAvailable: true
  }
];

export const categories = [
  { 
    id: 'burgers', 
    name: 'Burgers', 
    icon: 'beef',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop&q=80'
  },
  { 
    id: 'tacos', 
    name: 'Tacos', 
    icon: 'wrap-text',
    image: 'https://images.unsplash.com/photo-1683062332605-4e1209d75346?w=400&h=400&fit=crop&q=80'
  },
  { 
    id: 'menus', 
    name: 'Menus', 
    icon: 'package',
    image: 'https://images.pexels.com/photos/2351274/pexels-photo-2351274.jpeg?w=400&h=400&fit=crop'
  },
  { 
    id: 'desserts', 
    name: 'Desserts', 
    icon: 'cake',
    image: 'https://images.unsplash.com/photo-1644158776192-2d24ce35da1d?w=400&h=400&fit=crop&q=80'
  },
  { 
    id: 'boissons', 
    name: 'Boissons', 
    icon: 'glass-water',
    image: 'https://images.unsplash.com/photo-1632996988606-274cfd06eb68?w=400&h=400&fit=crop&q=80'
  }
];

export const promotions = [
  {
    id: 'promo-1',
    title: 'Menu King à 9,90€',
    description: 'Profitez de notre menu signature à prix réduit',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&q=80',
    validUntil: '2025-08-31'
  },
  {
    id: 'promo-2',
    title: 'Tiramisu offert le mardi',
    description: 'Un tiramisu Nutella offert pour toute commande > 15€',
    imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200&q=80',
    validUntil: '2025-12-31'
  },
  {
    id: 'promo-3',
    title: '2 Tacos achetés = 1 boisson offerte',
    description: 'Valable tous les mercredis',
    imageUrl: 'https://images.unsplash.com/photo-1613514785940-daed07799d3b?w=1200&q=80',
    validUntil: '2025-12-31'
  }
];

export const productOptions = {
  'burger-1': [
    {
      id: 'opt-group-1',
      name: 'Type de pain',
      type: 'single',
      required: true,
      options: [
        { id: 'opt-1', name: 'Pain classique', deltaPrice: 0 },
        { id: 'opt-2', name: 'Pain brioché', deltaPrice: 0.50 }
      ]
    },
    {
      id: 'opt-group-2',
      name: 'Fromage',
      type: 'single',
      required: false,
      options: [
        { id: 'opt-3', name: 'Cheddar', deltaPrice: 0 },
        { id: 'opt-4', name: 'Emmental', deltaPrice: 0 },
        { id: 'opt-5', name: 'Double fromage', deltaPrice: 0.80 }
      ]
    },
    {
      id: 'opt-group-3',
      name: 'Extras',
      type: 'multi',
      required: false,
      options: [
        { id: 'opt-6', name: 'Bacon supplémentaire', deltaPrice: 1.50 },
        { id: 'opt-7', name: 'Double steak', deltaPrice: 2.50 },
        { id: 'opt-8', name: 'Œuf', deltaPrice: 1.00 }
      ]
    }
  ]
};

// User mock data
export const mockUser = {
  id: 'user-1',
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '06 12 34 56 78',
  loyaltyStamps: 7,
  favoriteProducts: ['burger-1', 'dessert-1'],
  orderHistory: [
    {
      id: 'order-1',
      date: '2025-07-15T18:30:00',
      items: [
        { productId: 'burger-1', name: 'Le King', quantity: 1, price: 9.90 },
        { productId: 'drink-2', name: 'Coca-Cola 50cl', quantity: 1, price: 3.50 }
      ],
      total: 13.40,
      status: 'completed'
    },
    {
      id: 'order-2',
      date: '2025-07-10T19:15:00',
      items: [
        { productId: 'menu-1', name: 'Menu King', quantity: 2, price: 27.80 }
      ],
      total: 27.80,
      status: 'completed'
    }
  ]
};

// Restaurant info
export const restaurantInfo = {
  name: "Family's",
  address: '123 Avenue de la République, 01000 Bourg-en-Bresse',
  phone: '04 74 XX XX XX',
  email: 'contact@familys-burger.fr',
  openingHours: {
    monday: { open: '11:00', close: '22:00' },
    tuesday: { open: '11:00', close: '22:00' },
    wednesday: { open: '11:00', close: '22:00' },
    thursday: { open: '11:00', close: '22:00' },
    friday: { open: '11:00', close: '23:00' },
    saturday: { open: '11:00', close: '23:00' },
    sunday: { open: '18:00', close: '22:00' }
  }
};
