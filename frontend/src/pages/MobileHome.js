import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Award, Flame } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import { promotions } from '../mockData';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import CountdownBanner from '../components/CountdownBanner';

const MobileHome = () => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, setIsCartOpen } = useApp();
  const [currentPromo, setCurrentPromo] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll()
        ]);
        
        // Filter only available products
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

  const bestSellers = products.filter(p => p.tags && p.tags.includes('best-seller')).slice(0, 4);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen">
      {/* Back Office Button - Top Right */}
      {process.env.REACT_APP_SHOW_ADMIN_SHORTCUT !== 'false' && (
        <button
          onClick={() => {
            const adminUrl = `${window.location.origin}/admin`;
            console.log('Opening Back Office:', adminUrl);
            window.open(adminUrl, '_blank', 'noopener,noreferrer');
          }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white px-4 py-2 rounded-full font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-[#FFD54F] rounded-full animate-pulse"></div>
          <span>BO</span>
        </button>
      )}
      
      {/* Hero Section with Logo - Full Screen Immersive */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,213,79,0.3),transparent_50%)]"></div>
          </div>
        </div>

        <div className="relative z-10 text-center space-y-8 px-6 py-12">
          {/* Logo - Centered and Large */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 blur-2xl opacity-50 bg-[#FFD54F] rounded-full scale-150"></div>
              
              {/* Logo with removed background using mix-blend-mode */}
              <img 
                src="https://customer-assets.emergentagent.com/job_foodie-hub-21/artifacts/ybj62fs7_logo%20family%27s%20ok%20%21.png" 
                alt="Family's Original Burger"
                className="relative h-48 w-auto object-contain"
                style={{
                  mixBlendMode: 'multiply',
                  filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 25px 50px rgba(0,0,0,0.4))'
                }}
              />
            </div>
          </div>

          {/* Subtitle with animation */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-[#FFD54F] text-[#121212] px-6 py-3 rounded-full font-black text-sm shadow-2xl animate-pulse">
              <Award className="w-5 h-5" />
              <span>Meilleur Fast-Food Bourg-en-Bresse</span>
            </div>
            
            <h1 className="text-4xl font-black leading-tight text-white">
              Savourez l'Excellence
              <br />
              <span className="text-[#FFD54F] text-5xl">chez Family's</span>
            </h1>
            
            <p className="text-xl text-white/95 font-semibold max-w-sm mx-auto">
              Burgers gourmands, tacos généreux
              <br />
              et desserts maison
            </p>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#121212] px-12 py-8 rounded-full text-2xl font-black shadow-2xl transition-all duration-300 active:scale-95 mt-6 border-4 border-[#121212]/10 inline-flex items-center"
          >
            Commander maintenant
            <ChevronRight className="w-7 h-7 ml-2" />
          </button>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-1 h-12 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Countdown Banner */}
      <section className="px-4 -mt-8 relative z-20 mb-4">
        <CountdownBanner
          endTime={new Date(Date.now() + 7200000).toISOString()} // 2 heures
          message="Menu King à 9,90€ !"
        />
      </section>

      {/* Promotions Carousel */}
      <section className="px-4 relative z-20 mb-8">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-2xl overflow-hidden">
          <div className="relative h-48">
            {promotions.map((promo, idx) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentPromo ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                  <div className="p-6 text-white w-full">
                    <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                    <p className="text-sm text-white/90">{promo.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2 py-3 bg-white dark:bg-[#1a1a1a]">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentPromo ? 'bg-[#C62828] w-8' : 'bg-gray-300 dark:bg-gray-600 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Horizontal Scroll */}
      <section className="px-4 mb-8">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4 px-2">Catégories</h2>
        <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/menu?category=${cat.id}`)}
              className="flex-shrink-0 w-28 bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl text-white font-bold">{cat.name[0]}</span>
              </div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white text-center">{cat.name}</h3>
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
            <Flame className="w-7 h-7 mr-2 text-[#C62828] fill-[#C62828]" />
            Best-Sellers
          </h2>
          <Button
            onClick={() => navigate('/menu')}
            variant="ghost"
            className="text-[#C62828] dark:text-[#FFD54F] font-bold"
          >
            Voir tout
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        <div className="space-y-4">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden shadow-lg active:scale-98 transition-all duration-200"
            >
              <div className="flex items-center p-4 space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-28 h-28 object-cover rounded-3xl"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-9 h-9 bg-white/95 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorite(product.id)
                          ? 'fill-[#C62828] text-[#C62828]'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="bg-[#FFD54F] text-[#121212] px-3 py-1 rounded-full text-xs font-bold">
                      Best-Seller
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#C62828] dark:text-[#FFD54F]">
                      {product.basePrice.toFixed(2)}€
                    </span>
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loyalty Banner */}
      <section className="px-4 mb-8">
        <div className="bg-gradient-to-r from-[#FFD54F] to-[#FFC107] rounded-[32px] p-6 shadow-xl">
          <div className="text-[#121212] text-center">
            <Award className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-2xl font-black mb-2">Cashback 5%</h2>
            <p className="text-base font-semibold mb-4">
              5% de tous tes achats crédités sur ta carte !
            </p>
            <Button
              onClick={() => navigate('/loyalty')}
              className="bg-[#C62828] hover:bg-[#8B0000] text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg active:scale-95 transition-all"
            >
              Voir mon cashback
            </Button>
          </div>
        </div>
      </section>

      {/* Spacing for bottom nav */}
      <div className="h-8"></div>
    </div>
  );
};

export default MobileHome;
