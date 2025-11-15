import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';

/**
 * Carte Produit V3 - Design moderne avec badges dynamiques
 */
export const ProductCardV3 = ({ product, onClick }) => {
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'promo':
        return 'bg-red-500 text-white';
      case 'bestseller':
        return 'bg-[#FFD54F] text-gray-900';
      case 'nouveau':
        return 'bg-blue-500 text-white';
      case 'cashback_booste':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getBadgeLabel = (badge) => {
    switch (badge) {
      case 'promo':
        return '🔥 PROMO';
      case 'bestseller':
        return '⭐ Best Seller';
      case 'nouveau':
        return '✨ Nouveau';
      case 'cashback_booste':
        return '⚡ Cashback x2';
      default:
        return badge;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍔</span>
          </div>
        )}
        
        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-2 left-2 ${getBadgeStyle(product.badge)} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
            {getBadgeLabel(product.badge)}
          </div>
        )}

        {/* Cashback indicator */}
        {product.cashback_amount && product.cashback_amount > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-xs font-bold text-gray-900">
              +{typeof product.cashback_amount === 'number' ? product.cashback_amount.toFixed(2) : product.cashback_amount}€
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Prix + Bouton */}
        <div className="flex items-center justify-between">
          <div>
            {product.original_price && product.original_price !== product.base_price ? (
              <div>
                <span className="text-gray-400 text-sm line-through mr-2">
                  {typeof product.original_price === 'number' ? product.original_price.toFixed(2) : product.original_price}€
                </span>
                <span className="text-[#C62828] font-black text-xl">
                  {typeof product.base_price === 'number' ? product.base_price.toFixed(2) : product.base_price}€
                </span>
              </div>
            ) : (
              <span className="text-gray-900 font-black text-xl">
                {typeof product.base_price === 'number' ? product.base_price.toFixed(2) : product.base_price}€
              </span>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-[#C62828] text-white p-2 rounded-full shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
