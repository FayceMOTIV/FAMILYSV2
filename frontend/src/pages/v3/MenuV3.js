import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Filter, X } from 'lucide-react';
import { ProductCardV3 } from '../../components/v3/ProductCardV3';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

/**
 * Page Menu V3 - Grille de produits avec filtres et badges
 */
export const MenuV3 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [cashbackSettings, setCashbackSettings] = useState({ loyalty_percentage: 5 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les settings pour le cashback
      try {
        const settingsRes = await axios.get(`${API_URL}/api/v1/cashback/settings`);
        setCashbackSettings(settingsRes.data);
      } catch (error) {
        console.log('Settings non disponibles:', error);
      }

      // Charger les catégories
      const categoriesRes = await axios.get(`${API_URL}/api/v1/admin/categories`);
      setCategories(categoriesRes.data.categories || []);

      // Charger les produits
      const productsRes = await axios.get(`${API_URL}/api/v1/admin/products`);
      const productsData = productsRes.data.products || [];
      
      // Calculer le cashback pour chaque produit
      const productsWithCashback = productsData.map(product => ({
        ...product,
        cashback_amount: ((product.base_price * cashbackSettings.loyalty_percentage) / 100).toFixed(2)
      }));

      setProducts(productsWithCashback);
    } catch (error) {
      console.error('Erreur chargement menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.is_available;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-black text-gray-900">Menu Family's</h1>
                <p className="text-sm text-gray-500">{filteredProducts.length} produits</p>
              </div>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Barre de recherche */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-[#C62828] focus:bg-white transition-all"
                      autoFocus
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filtres catégories */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto flex gap-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#C62828] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tout
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#C62828] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de produits */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500 text-lg font-medium">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Essaie une autre catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCardV3
                  product={product}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
