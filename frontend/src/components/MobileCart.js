import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Award, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import SwipeableCartItem from './SwipeableCartItem';
import EmptyState from './EmptyState';
import { promotionsAPI } from '../services/promotionsAPI';

const MobileCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, user, loyaltyStamps } = useApp();
  const [useCashback, setUseCashback] = useState(false);
  const [promotionResult, setPromotionResult] = useState(null);
  const [loadingPromo, setLoadingPromo] = useState(false);

  // Calcul du cashback disponible
  const totalSpent = user?.orderHistory?.reduce((sum, order) => sum + order.total, 0) || 0;
  const cashbackBalance = totalSpent * 0.05; // 5%
  const canUseCashback = cashbackBalance >= 10;

  const subtotal = getCartTotal();
  
  // Calculate promotions when cart changes
  useEffect(() => {
    const calculatePromotions = async () => {
      if (cart.length === 0) {
        setPromotionResult(null);
        return;
      }

      setLoadingPromo(true);
      try {
        // Build cart object for API
        const cartData = {
          items: cart.map(item => ({
            product_id: item.product?.id || item.id,
            name: item.product?.name || item.name,
            price: item.totalPrice / item.quantity,
            quantity: item.quantity,
            category_id: item.product?.category || item.category
          })),
          total: subtotal,
          delivery_fee: 0
        };

        const result = await promotionsAPI.simulate(cartData, user);
        setPromotionResult(result);
      } catch (error) {
        console.error('Error calculating promotions:', error);
        setPromotionResult(null);
      } finally {
        setLoadingPromo(false);
      }
    };

    calculatePromotions();
  }, [cart, subtotal, user]);

  const promoDiscount = promotionResult?.total_discount || 0;
  const subtotalAfterPromo = subtotal - promoDiscount;
  const cashbackUsed = useCashback && canUseCashback ? Math.min(cashbackBalance, subtotalAfterPromo) : 0;
  const total = subtotalAfterPromo - cashbackUsed;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] dark:bg-[#121212] z-[9999] overflow-hidden">
      {/* Full Screen Cart */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-[#1a1a1a] px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">
                Mon Panier
              </h1>
            </div>
            <div className="bg-[#C62828] dark:bg-[#FFD54F] text-white dark:text-[#121212] px-4 py-2 rounded-full">
              <span className="font-black">{cart.length} article{cart.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
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
            {/* Cashback Section */}
            {user && cashbackBalance > 0 && (
              <div className={`p-4 rounded-2xl border-2 transition-all ${
                useCashback && canUseCashback
                  ? 'bg-gradient-to-r from-[#FFD54F]/20 to-[#FFC107]/20 border-[#FFD54F]'
                  : 'bg-gray-50 dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-[#FFD54F]" />
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        Cashback disponible
                      </div>
                      <div className="text-2xl font-black text-[#C62828] dark:text-[#FFD54F]">
                        {cashbackBalance.toFixed(2)}€
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseCashback(!useCashback)}
                    disabled={!canUseCashback}
                    className={`w-16 h-8 rounded-full transition-all ${
                      useCashback && canUseCashback
                        ? 'bg-[#C62828]'
                        : canUseCashback
                        ? 'bg-gray-300 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700 opacity-50'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                      useCashback && canUseCashback ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {!canUseCashback && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum 10€ pour utiliser le cashback
                  </p>
                )}
                {useCashback && canUseCashback && (
                  <p className="text-sm text-[#C62828] dark:text-[#FFD54F] font-semibold">
                    ✓ -{cashbackUsed.toFixed(2)}€ appliqué sur cette commande
                  </p>
                )}
              </div>
            )}

            {/* Price Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              {cashbackUsed > 0 && (
                <div className="flex justify-between text-[#C62828] dark:text-[#FFD54F] font-semibold">
                  <span>Cashback utilisé</span>
                  <span>-{cashbackUsed.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                <span className="font-bold text-xl text-gray-800 dark:text-white">Total</span>
                <span className="font-black text-4xl text-[#C62828] dark:text-[#FFD54F]">
                  {total.toFixed(2)}€
                </span>
              </div>
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
    </div>
  );
};

export default MobileCart;
