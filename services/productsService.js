// Service pour gérer les produits - Connecté au backend
import { API_BASE_URL } from '../constants/config';

// Récupérer tous les produits
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    console.log('✅ Produits chargés depuis le backend :', data.products?.length);
    return data.products || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits :', error);
    return [];
  }
};

// Récupérer un produit par ID
export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await response.json();
    console.log('✅ Produit chargé :', data.name);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du produit :', error);
    return null;
  }
};

// Récupérer les catégories depuis le backend
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    console.log('✅ Catégories chargées depuis le backend :', data.categories?.length);
    
    // Transformer les catégories backend en format app
    const backendCategories = (data.categories || [])
      .filter(cat => cat.id && cat.name)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.icon || '📦',
        image: cat.image
      }));
    
    const categories = [
      { id: 'all', name: 'Tout', emoji: '🍽️' },
      ...backendCategories
    ];
    
    return categories;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories :', error);
    return [{ id: 'all', name: 'Tout', emoji: '🍽️' }];
  }
};

// Filtrer les produits par catégorie (par ID ou par nom)
export const filterByCategory = (products, categoryId, categoryName = null) => {
  if (categoryId === 'all') return products;
  
  return products.filter(p => {
    // Comparer avec l'ID de catégorie
    if (p.category_id === categoryId) return true;
    // Comparer avec le nom de catégorie (fallback)
    if (p.category === categoryId) return true;
    // Comparer avec le nom passé en paramètre
    if (categoryName && p.category === categoryName) return true;
    return false;
  });
};

// Recherche de produits
export const searchProducts = (products, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(term) || 
    (p.description && p.description.toLowerCase().includes(term))
  );
};

// Helper : Vérifier si un produit est populaire
export const isPopular = (product) => {
  return product.tags?.includes('popular') || 
         product.badge === 'bestseller' ||
         product.badge === 'best-seller';
};

// Helper : Obtenir le prix d'affichage du produit
export const getProductPrice = (product) => {
  return product.base_price || product.price || 0;
};

export default {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  filterByCategory,
  searchProducts,
  isPopular,
  getProductPrice,
};
