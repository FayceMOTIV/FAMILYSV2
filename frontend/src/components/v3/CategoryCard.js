import React from 'react';
import { motion } from 'framer-motion';

/**
 * Carte Catégorie - Gros blocs visuels pour navigation rapide
 */
export const CategoryCard = ({ category, onClick, emoji }) => {
  const getCategoryGradient = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('burger')) return 'from-red-500 to-orange-500';
    if (lowerName.includes('taco')) return 'from-yellow-500 to-amber-600';
    if (lowerName.includes('dessert')) return 'from-pink-500 to-rose-500';
    if (lowerName.includes('boisson') || lowerName.includes('drink')) return 'from-blue-500 to-cyan-500';
    if (lowerName.includes('menu')) return 'from-purple-500 to-indigo-500';
    return 'from-gray-600 to-gray-700';
  };

  const getCategoryEmoji = (name) => {
    if (emoji) return emoji;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('burger')) return '🍔';
    if (lowerName.includes('taco')) return '🌯';
    if (lowerName.includes('dessert')) return '🍰';
    if (lowerName.includes('boisson') || lowerName.includes('drink')) return '🥤';
    if (lowerName.includes('menu')) return '⭐';
    if (lowerName.includes('frite') || lowerName.includes('side')) return '🍟';
    if (lowerName.includes('sauce')) return '🥫';
    return '🍽️';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative bg-gradient-to-br ${getCategoryGradient(category.name)} rounded-2xl p-6 shadow-lg cursor-pointer overflow-hidden min-h-[120px] flex flex-col justify-between`}
    >
      {/* Pattern de fond */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="text-4xl mb-2">{getCategoryEmoji(category.name)}</div>
        <h3 className="text-white font-black text-lg">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-white/80 text-xs mt-1">
            {category.description}
          </p>
        )}
      </div>

      {/* Nombre de produits */}
      {category.product_count && (
        <div className="relative z-10 mt-2">
          <span className="text-white/70 text-xs">
            {category.product_count} produit{category.product_count > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.div>
  );
};
