import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useApp();

  const total = getCartTotal();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-[#1a1a1a] shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-[#C62828] dark:text-[#FFD54F] flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Votre Panier
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Votre panier est vide</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Ajoutez des produits pour commencer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-[#1f1f1f] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                        {item.options && item.options.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                            {item.options.map((opt, idx) => (
                              <div key={idx}>
                                + {opt.name} {opt.deltaPrice > 0 && `(+${opt.deltaPrice.toFixed(2)}€)`}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 bg-white dark:bg-[#2a2a2a] rounded-full p-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-[#C62828] dark:text-[#FFD54F]">
                              {item.totalPrice.toFixed(2)}€
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total</span>
                <span className="font-bold text-2xl text-[#C62828] dark:text-[#FFD54F]">
                  {total.toFixed(2)}€
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Passer la commande
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
