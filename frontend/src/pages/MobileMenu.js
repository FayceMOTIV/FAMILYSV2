import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Search, X, ShoppingBag, AlertCircle } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const MobileMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toggleFavorite, isFavorite, setIsCartOpen, getCartItemsCount } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartCount = getCartItemsCount();

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll()
        ]);
        
        // Filter only available products (is_available = true)
        const availableProducts = (productsRes.products || []).filter(p => p.is_available !== false);
        setProducts(availableProducts);
        setCategories(categoriesRes.categories || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`);
  };

  const getBadgeColor = (tag) => {
    switch (tag) {
      case 'best-seller':
        return 'bg-[#FFD54F] text-[#121212]';
      case 'new':
        return 'bg-[#C62828] text-white';
      case 'popular':
        return 'bg-[#B08968] text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getBadgeLabel = (tag) => {
    switch (tag) {
      case 'best-seller':
        return 'Best-Seller';
      case 'new':
        return 'Nouveau';
      case 'popular':
        return 'Populaire';
      default:
        return tag;
    }
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white pt-8 pb-6 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black">Notre Menu</h1>
          {cartCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full active:scale-95 transition-transform"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-[#FFD54F] text-[#121212] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-6 rounded-full text-base bg-white dark:bg-[#1a1a1a] border-0 shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters - Horizontal Scroll with Images */}
      <div className="sticky top-[140px] z-10 bg-[#FAFAFA] dark:bg-[#121212] px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-[#C62828] text-white shadow-lg scale-105'
                : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 shadow'
            }`}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative flex-shrink-0 w-28 h-28 rounded-3xl overflow-hidden transition-all duration-300 active:scale-95 ${
                selectedCategory === cat.id
                  ? 'ring-4 ring-[#C62828] shadow-xl scale-105'
                  : 'shadow-md'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-3 ${
                selectedCategory === cat.id ? 'from-[#C62828]/90 via-[#C62828]/60' : ''
              }`}>
                <span className="text-white font-bold text-sm">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const imageUrl = product.image_url || product.image || product.imageUrl;
            const price = product.base_price || product.basePrice || 0;
            const isOutOfStock = product.is_out_of_stock || false;
            
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleProductClick(product)}
                className={`bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden shadow-lg transition-all duration-200 ${
                  isOutOfStock ? 'opacity-75' : 'active:scale-98'
                }`}
              >
                <div className="flex items-center p-4 space-x-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={`w-28 h-28 object-cover rounded-3xl ${isOutOfStock ? 'grayscale' : ''}`}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Indisponible
                        </div>
                      </div>
                    )}
                    {!isOutOfStock && product.tags && product.tags.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getBadgeColor(product.tags[0])}`}>
                          {getBadgeLabel(product.tags[0])}
                        </span>
                      </div>
                    )}
                    {!isOutOfStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute bottom-2 right-2 w-9 h-9 bg-white/95 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFavorite(product.id)
                              ? 'fill-[#C62828] text-[#C62828]'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    {isOutOfStock && (
                      <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
                        Temporairement indisponible
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#C62828] dark:text-[#FFD54F]">
                        {price.toFixed(2)}€
                      </span>
                      {!isOutOfStock && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          size="sm"
                          className="bg-[#C62828] hover:bg-[#8B0000] text-white rounded-full px-6 py-5 font-bold active:scale-95"
                        >
                          +
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez une autre catégorie
            </p>
          </div>
        )}
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-8"></div>
    </div>
  );
};

export default MobileMenu;
