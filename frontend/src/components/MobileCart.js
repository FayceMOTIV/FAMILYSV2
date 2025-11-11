import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import SwipeableCartItem from './SwipeableCartItem';
import EmptyState from './EmptyState';

const MobileCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useApp();

  const total = getCartTotal();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] rounded-t-[32px] shadow-2xl z-[70] transform transition-transform duration-300 max-h-[85vh] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-[#C62828] dark:text-[#FFD54F] flex items-center">
            <ShoppingBag className="w-7 h-7 mr-3" />
            Votre Panier
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(85vh - 220px)' }}>
          {cart.length === 0 ? (
            <EmptyState 
              type="cart" 
              onAction={() => {
                onClose();
                navigate('/menu');
              }}
              actionLabel="Découvrir le menu"
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">
                💡 Clique sur la poubelle pour supprimer (ou glisse sur mobile)
              </p>
              {cart.map((item) => (
                <SwipeableCartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5 space-y-4 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl text-gray-700 dark:text-gray-300">Total</span>
              <span className="font-bold text-3xl text-[#C62828] dark:text-[#FFD54F]">
                {total.toFixed(2)}€
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-7 rounded-3xl text-xl font-bold shadow-lg transition-all duration-300 active:scale-95"
            >
              Commander
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileCart;
