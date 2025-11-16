import React from 'react';
import { CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Carte de Fidélité style "wallet" - Affichage premium du solde - MISE EN AVANT
 */
export const CashbackCard = ({ balance = 0, earnedToday = 0, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -0.5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-[#C62828] via-[#D32F2F] to-[#8B0000] rounded-3xl p-8 shadow-2xl cursor-pointer overflow-hidden border-2 border-[#FFD54F]/30"
    >
      {/* Effet brillant animé */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 opacity-20 pointer-events-none"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD54F] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
      </motion.div>

      {/* Badge "Gagne des points" */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-2 -right-2 bg-[#FFD54F] text-[#C62828] px-3 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
      >
        <Sparkles className="w-3 h-3" />
        🎁 +5% fidélité
      </motion.div>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white text-base font-bold block">Ma Carte de Fidélité</span>
              <span className="text-white/60 text-xs">À dépenser sans limite</span>
            </div>
          </div>
          <span className="text-[#FFD54F] text-sm font-black uppercase tracking-wider">Family's</span>
        </div>

        {/* Solde - PLUS GRAND */}
        <div className="mb-6">
          <p className="text-white/80 text-sm mb-2 font-medium">💰 Solde disponible</p>
          <motion.p 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-white text-5xl font-black tracking-tight"
          >
            {balance.toFixed(2)} <span className="text-3xl text-[#FFD54F]">€</span>
          </motion.p>
        </div>

        {/* Gainé aujourd'hui */}
        {earnedToday > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-xl px-4 py-3 mb-4 border border-white/20"
          >
            <TrendingUp className="w-5 h-5 text-[#FFD54F]" />
            <span className="text-white text-sm font-semibold">
              +{earnedToday.toFixed(2)}€ gagné aujourd'hui 🎉
            </span>
          </motion.div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
          <span className="text-xl">✨</span>
          <p className="text-white/90 text-sm font-medium">
            Utilise tes points fidélité sur ta prochaine commande ou accumule-les !
          </p>
        </div>
      </div>

      {/* Chip design doré */}
      <motion.div 
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#FFD54F] to-[#FFA726] backdrop-blur-sm rounded-xl shadow-xl opacity-80"
      />
    </motion.div>
  );
};
