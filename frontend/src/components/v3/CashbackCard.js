import React from 'react';
import { CreditCard, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Carte Cashback style "wallet" - Affichage premium du solde
 */
export const CashbackCard = ({ balance = 0, earnedToday = 0, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828] rounded-2xl p-6 shadow-2xl cursor-pointer overflow-hidden"
    >
      {/* Pattern de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/90 text-sm font-medium">Carte Cashback</span>
          </div>
          <span className="text-[#FFD54F] text-xs font-bold uppercase tracking-wider">Family's</span>
        </div>

        {/* Solde */}
        <div className="mb-4">
          <p className="text-white/70 text-xs mb-1">Solde disponible</p>
          <p className="text-white text-4xl font-black">
            {balance.toFixed(2)} <span className="text-2xl">€</span>
          </p>
        </div>

        {/* Gainé aujourd'hui */}
        {earnedToday > 0 && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4 text-[#FFD54F]" />
            <span className="text-white/90 text-xs">
              +{earnedToday.toFixed(2)}€ gagné aujourd'hui
            </span>
          </div>
        )}

        {/* Info */}
        <p className="text-white/60 text-xs mt-4">
          Utilisable dès maintenant sur ta prochaine commande
        </p>
      </div>

      {/* Chip design */}
      <div className="absolute bottom-4 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg" />
    </motion.div>
  );
};
