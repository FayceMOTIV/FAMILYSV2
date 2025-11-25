import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

const AddToCartAnimation = ({ trigger, productImage }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      
      // Vibration haptic
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Reset animation
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [trigger]);

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {/* Burger qui vole vers le panier */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: 'flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
        }}
      >
        <div className="relative">
          <img
            src={productImage}
            alt="Product"
            className="w-24 h-24 rounded-full object-cover shadow-2xl"
            style={{
              animation: 'spin 0.8s linear'
            }}
          />
          <div className="absolute inset-0 bg-[#FFD54F] rounded-full opacity-50 animate-ping" />
        </div>
      </div>

      {/* Particules d'étoiles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{
            animation: `particle-${i} 0.6s ease-out forwards`,
            animationDelay: '0.2s'
          }}
        >
          <div className="w-2 h-2 bg-[#FFD54F] rounded-full" />
        </div>
      ))}

      <style>{`
        @keyframes flyToCart {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(50vw - 100px), calc(-50vh + 100px)) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(0.5); }
        }

        ${[...Array(8)].map((_, i) => `
          @keyframes particle-${i} {
            0% {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
            100% {
              transform: translate(
                calc(-50% + ${Math.cos((i * Math.PI * 2) / 8) * 100}px),
                calc(-50% + ${Math.sin((i * Math.PI * 2) / 8) * 100}px)
              );
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default AddToCartAnimation;
