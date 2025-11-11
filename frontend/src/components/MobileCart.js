import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import SwipeableCartItem from './SwipeableCartItem';
import EmptyState from './EmptyState';

const MobileCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, user, loyaltyStamps } = useApp();
  const [useCashback, setUseCashback] = useState(false);

  // Calcul du cashback disponible
  const totalSpent = user?.orderHistory?.reduce((sum, order) => sum + order.total, 0) || 0;
  const cashbackBalance = totalSpent * 0.05; // 5%
  const canUseCashback = cashbackBalance >= 10;

  const subtotal = getCartTotal();
  const cashbackUsed = useCashback && canUseCashback ? Math.min(cashbackBalance, subtotal) : 0;
  const total = subtotal - cashbackUsed;

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
