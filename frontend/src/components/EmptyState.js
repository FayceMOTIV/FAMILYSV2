import React from 'react';
import { ShoppingBag, Heart, Search, Package } from 'lucide-react';
import { Button } from './ui/button';

const EmptyState = ({ type = 'cart', onAction, actionLabel }) => {
  const states = {
    cart: {
      icon: ShoppingBag,
      title: 'Ton panier a faim !',
      description: 'Ajoute des burgers délicieux pour commencer ta commande',
      emoji: '🍔',
      color: 'text-[#C62828]'
    },
    favorites: {
      icon: Heart,
      title: 'Aucun favori pour l’instant',
      description: 'Clique sur l’étoile pour ajouter tes produits préférés',
      emoji: '⭐',
      color: 'text-[#FFD54F]'
    },
    search: {
      icon: Search,
      title: 'Aucun résultat',
      description: 'Essaye un autre terme de recherche ou parcours nos catégories',
      emoji: '🔍',
      color: 'text-gray-400'
    },
    orders: {
      icon: Package,
      title: 'Pas encore de commande',
      description: 'Ta première commande t’attend ! Découvre nos burgers légendaires',
      emoji: '🎉',
      color: 'text-[#C62828]'
    }
  };

  const state = states[type] || states.cart;
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Emoji animé */}
      <div className="text-8xl mb-6 animate-bounce">
        {state.emoji}
      </div>

      {/* Icône */}
      <div className={`w-20 h-20 ${state.color} mb-6 opacity-30`}>
        <Icon className="w-full h-full" strokeWidth={1.5} />
      </div>

      {/* Titre */}
      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">
        {state.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-base max-w-sm mb-8">
        {state.description}
      </p>

      {/* Action button */}
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white px-10 py-7 rounded-full text-lg font-bold shadow-lg active:scale-95 transition-all"
        >
          {actionLabel || 'Découvrir le menu'}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
