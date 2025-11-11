import React, { useState, useRef } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SwipeableCartItem = ({ item }) => {
  const { removeFromCart, updateCartQuantity } = useApp();
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Limite le swipe à gauche uniquement
    if (diff < 0) {
      setSwipeX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeX < -60) {
      // Suppression
      if (navigator.vibrate) navigator.vibrate(50);
      removeFromCart(item.id);
    } else {
      // Reset position
      setSwipeX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background rouge avec icône poubelle */}
      <div className="absolute inset-0 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-end px-6">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Item glissable */}
      <div
        className="bg-gray-50 dark:bg-[#1f1f1f] rounded-3xl p-4 shadow-sm relative"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start space-x-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1 truncate">
              {item.name}
            </h3>
            {item.options && item.options.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-0.5">
                {item.options.map((opt, idx) => (
                  <div key={idx} className="truncate">
                    + {opt.name}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-white dark:bg-[#2a2a2a] rounded-full px-1 py-1">
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-lg min-w-[32px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="font-bold text-xl text-[#C62828] dark:text-[#FFD54F]">
                {item.totalPrice.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCartItem;
