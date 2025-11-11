import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, ChevronRight } from 'lucide-react';
import { products } from '../mockData';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';

const MobileFavorites = () => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, user } = useApp();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#121212]">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
            Vos Favoris
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez-vous pour voir vos produits favoris
          </p>
          <Button
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white py-7 rounded-full text-lg font-bold active:scale-95"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white pt-8 pb-8 px-4">
        <h1 className="text-3xl font-black mb-2 flex items-center">
          <Heart className="w-10 h-10 mr-3 fill-white" />
          Mes Favoris
        </h1>
        <p className="text-lg opacity-90">
          Retrouve tes produits préférés
        </p>
      </div>

      <div className="px-4 py-6">
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
              Aucun favori
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-base px-6">
              Ajoute des produits à tes favoris pour les retrouver facilement
            </p>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white px-10 py-7 rounded-full text-lg font-bold active:scale-95"
            >
              Découvrir le menu
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteProducts.map((product) => (
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
                    {product.tags.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-[#FFD54F] text-[#121212] px-2 py-1 rounded-full text-xs font-bold">
                          {product.tags[0] === 'best-seller' ? 'Best' : product.tags[0]}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute bottom-2 right-2 w-9 h-9 bg-white/95 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <Star className="w-5 h-5 fill-[#C62828] text-[#C62828]" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 truncate">
                      {product.name}
                    </h3>
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
                        className="bg-[#C62828] hover:bg-[#8B0000] text-white rounded-full px-6 py-5 font-bold active:scale-95 flex items-center space-x-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>+</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestion */}
            <div className="bg-gradient-to-r from-[#FFD54F] to-[#FFC107] rounded-[32px] p-6 text-[#121212] text-center mt-6">
              <div className="text-4xl mb-3">😋</div>
              <h3 className="text-xl font-black mb-2">Tu avais adoré !</h3>
              <p className="text-sm font-semibold mb-4">
                Recommande tes plats favoris en un clic
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-8"></div>
    </div>
  );
};

export default MobileFavorites;
