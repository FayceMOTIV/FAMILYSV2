import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import { products } from '../mockData';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

const RecommendedProducts = ({ currentProductId, userHistory = [] }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();

  // AI Recommendations basées sur :
  // 1. Produits similaires (même catégorie)
  // 2. Souvent achetés ensemble
  // 3. Best-sellers
  const getRecommendations = () => {
    const currentProduct = products.find(p => p.id === currentProductId);
    if (!currentProduct) return products.filter(p => p.tags.includes('best-seller')).slice(0, 3);

    // Produits de la même catégorie
    const sameCategory = products.filter(
      p => p.category === currentProduct.category && p.id !== currentProductId
    );

    // Mix avec des best-sellers
    const bestSellers = products.filter(p => p.tags.includes('best-seller') && p.id !== currentProductId);

    // Combine et limite à 3
    const recommendations = [...sameCategory.slice(0, 2), ...bestSellers.slice(0, 1)];
    return recommendations.slice(0, 3);
  };

  const recommended = getRecommendations();

  if (recommended.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FFD54F] to-[#FFC107] rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#121212]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-800 dark:text-white">
            Recommandé pour toi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Basé sur tes préférences
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommended.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.slug}`)}
            className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-[#0f0f0f] rounded-2xl active:scale-98 transition-all cursor-pointer"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-white truncate">
                {product.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-black text-[#C62828] dark:text-[#FFD54F]">
                  {product.basePrice.toFixed(2)}€
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="p-2 hover:bg-white dark:hover:bg-[#1a1a1a] rounded-full transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorite(product.id)
                        ? 'fill-[#C62828] text-[#C62828]'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
