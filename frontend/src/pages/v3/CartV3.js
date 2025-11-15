import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Plus, Minus, TrendingUp, ShoppingBag, ChevronRight, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

/**
 * Panier V3 - Avec preview cashback et option d'utilisation
 */
export const CartV3 = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, user } = useApp();
  
  const [cashbackPreview, setCashbackPreview] = useState(null);
  const [useCashback, setUseCashback] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      loadCashbackPreview();
    }
  }, [cart, useCashback, user]);

  const loadCashbackPreview = async () => {
    try {
      const subtotal = getSubtotal();
      const total = getTotal();

      const response = await axios.post(`${API_URL}/api/v1/cashback/preview`, {
        customer_id: user?.id || null,
        subtotal: subtotal,
        total_after_promos: total,
        promo_discount: 0,
        use_cashback: useCashback
      });

      setCashbackPreview(response.data);
    } catch (error) {
      console.log('Erreur preview cashback:', error);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.total_price || item.base_price * item.quantity), 0);
  };

  const getTotal = () => {
    return getSubtotal(); // Pour l'instant sans promos appliquées
  };

  const getFinalTotal = () => {
    if (cashbackPreview && useCashback) {
      return cashbackPreview.remaining_to_pay;
    }
    return getTotal();
  };

  const handleCheckout = () => {
    navigate('/checkout-v3', { 
      state: { 
        useCashback,
        cashbackPreview 
      } 
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Ton panier est vide</h2>
          <p className="text-gray-500 mb-8">Commence par ajouter des produits !</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-r from-[#C62828] to-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
          >
            Découvrir le menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Mon Panier</h1>
              <p className="text-sm text-gray-500">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="text-[#C62828] font-bold text-sm"
            >
              Continuer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Articles */}
        {cart.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex gap-4">
              {/* Image placeholder */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl">🍔</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {item.base_price.toFixed(2)}€ × {item.quantity}
                </p>

                {/* Quantité */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateCartItemQuantity(index, item.quantity - 1);
                      } else {
                        removeFromCart(index);
                      }
                    }}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </button>
                  <span className="font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prix */}
              <div className="text-right">
                <p className="font-black text-lg text-gray-900">
                  {(item.total_price || item.base_price * item.quantity).toFixed(2)}€
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Bloc Cashback Preview */}
        {cashbackPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-full flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-green-900 text-lg mb-1">
                  💳 Cashback de cette commande
                </h3>
                <p className="text-green-800 text-sm mb-3">
                  En validant cette commande, tu vas gagner <strong className="text-xl">{cashbackPreview.cashback_earned.toFixed(2)}€</strong> sur ta carte Family's.
                </p>
                
                {user && cashbackPreview.cashback_available > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-green-900 text-sm mb-2">
                      💰 Solde actuel : <strong>{cashbackPreview.cashback_available.toFixed(2)}€</strong>
                    </p>
                    <p className="text-green-800 text-xs mb-3">
                      Nouveau solde estimé après commande : <strong>{cashbackPreview.new_balance_after_order.toFixed(2)}€</strong>
                    </p>

                    {/* Option utiliser le cashback */}
                    <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <input
                        type="checkbox"
                        checked={useCashback}
                        onChange={(e) => setUseCashback(e.target.checked)}
                        className="w-5 h-5 mt-0.5 text-[#C62828] rounded"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 text-sm">
                          Utiliser ma cagnotte cashback sur cette commande
                        </p>
                        {useCashback && cashbackPreview.cashback_to_use > 0 && (
                          <p className="text-amber-800 text-xs mt-1">
                            ✅ {cashbackPreview.cashback_to_use.toFixed(2)}€ seront déduits de ton total
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Totaux */}
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span className="font-medium">{getSubtotal().toFixed(2)}€</span>
            </div>
            
            {useCashback && cashbackPreview?.cashback_to_use > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cashback utilisé</span>
                <span className="font-bold">-{cashbackPreview.cashback_to_use.toFixed(2)}€</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{getFinalTotal().toFixed(2)}€</span>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C62828] to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-between px-6"
          >
            <span>Commander maintenant</span>
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
