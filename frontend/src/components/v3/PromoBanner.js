import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Sparkles } from 'lucide-react';

/**
 * Bannière de promotion dynamique
 * Affiche les promos actives du backend
 */
export const PromoBanner = ({ promo, onClick }) => {
  const getPromoIcon = (type) => {
    switch (type) {
      case 'happy_hour':
        return <Clock className="w-5 h-5" />;
      case 'flash':
        return <Zap className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPromoColor = (type) => {
    switch (type) {
      case 'happy_hour':
        return 'from-purple-500 to-pink-500';
      case 'flash':
        return 'from-orange-500 to-red-500';
      case 'loyalty_multiplier':
        return 'from-amber-500 to-yellow-500';
      default:
        return 'from-[#C62828] to-orange-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative bg-gradient-to-r ${getPromoColor(promo.type)} rounded-2xl p-4 shadow-lg cursor-pointer overflow-hidden`}
    >
      {/* Pattern animé */}
      <motion.div
        animate={{
          x: [0, 10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
      </motion.div>

      {/* Contenu */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          {getPromoIcon(promo.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base mb-0.5">
            {promo.title || "🔥 Offre du moment"}
          </h3>
          <p className="text-white/90 text-sm">
            {promo.description || promo.badge_text}
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-sm font-bold">{promo.discount_value}%</span>
        </div>
      </div>
    </motion.div>
  );
};
