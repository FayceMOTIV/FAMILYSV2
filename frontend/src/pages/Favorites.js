import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { products } from '../mockData';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, user } = useApp();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Vos Favoris
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez-vous pour voir vos produits favoris
          </p>
          <Button
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-6 rounded-2xl font-bold"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
            <Heart className="w-10 h-10 mr-4 fill-white" />
            Mes Favoris
          </h1>
          <p className="text-xl text-white/90">
            Retrouvez tous vos produits préférés
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Ajoutez des produits à vos favoris pour les retrouver facilement
            </p>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white px-8 py-6 rounded-2xl text-lg font-bold"
            >
              Découvrir nos produits
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#FFD54F] text-[#121212] px-3 py-1 rounded-full text-xs font-bold"
                      >
                        {tag === 'best-seller' ? 'Best-Seller' : tag === 'new' ? 'Nouveau' : 'Populaire'}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-black/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Star className="w-5 h-5 fill-[#C62828] text-[#C62828]" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#C62828] dark:text-[#FFD54F]">
                      {product.basePrice.toFixed(2)}€
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="bg-[#C62828] hover:bg-[#8B0000] text-white rounded-full px-6"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
