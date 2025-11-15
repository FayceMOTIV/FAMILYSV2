import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Wallet, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

/**
 * Checkout V3 - Finalisation commande avec cashback
 */
export const CheckoutV3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, user, clearCart } = useApp();
  
  const { useCashback, cashbackPreview } = location.state || {};
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.total_price || item.base_price * item.quantity), 0);
  };

  const getTotal = () => {
    if (useCashback && cashbackPreview) {
      return cashbackPreview.remaining_to_pay;
    }
    return getSubtotal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer la commande
      const orderData = {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          base_price: item.base_price,
          quantity: item.quantity,
          options: item.options || [],
          total_price: item.total_price || item.base_price * item.quantity,
          notes: item.notes
        })),
        subtotal: getSubtotal(),
        vat_amount: getSubtotal() * 0.1,
        total: getTotal(),
        use_cashback: useCashback || false,
        payment_method: paymentMethod,
        consumption_mode: 'takeaway',
        pickup_date: new Date().toISOString().split('T')[0],
        pickup_time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      };

      const response = await axios.post(`${API_URL}/api/v1/orders`, orderData);

      if (response.data.success) {
        setSuccess(true);
        clearCart();
        
        // Rediriger vers une page de confirmation
        setTimeout(() => {
          navigate('/order-success', {
            state: {
              order: response.data,
              cashbackEarned: response.data.cashback_earned
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Erreur création commande:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Commande validée !</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-gray-900">Finaliser ma commande</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Infos client */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Mes informations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                placeholder="jean@exemple.fr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Mode de paiement</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C62828] transition-colors">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-[#C62828]"
              />
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-bold text-gray-900">Carte bancaire</p>
                <p className="text-sm text-gray-500">Paiement en ligne sécurisé</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C62828] transition-colors">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-[#C62828]"
              />
              <Wallet className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-bold text-gray-900">Sur place</p>
                <p className="text-sm text-gray-500">Paiement au restaurant</p>
              </div>
            </label>
          </div>
        </div>

        {/* Récap cashback */}
        {cashbackPreview && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
            <h3 className="font-black text-green-900 mb-3">💳 Résumé cashback</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-800">Cashback gagné</span>
                <span className="font-bold text-green-900">+{cashbackPreview.cashback_earned.toFixed(2)}€</span>
              </div>
              {useCashback && cashbackPreview.cashback_to_use > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-800">Cashback utilisé</span>
                  <span className="font-bold text-green-900">-{cashbackPreview.cashback_to_use.toFixed(2)}€</span>
                </div>
              )}
              {cashbackPreview.new_balance_after_order !== undefined && (
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="text-green-800">Nouveau solde</span>
                  <span className="font-black text-green-900">{cashbackPreview.new_balance_after_order.toFixed(2)}€</span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Bottom sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex justify-between text-xl font-black text-gray-900">
            <span>Total à payer</span>
            <span>{getTotal().toFixed(2)}€</span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C62828] to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50"
          >
            {loading ? 'Validation...' : 'Valider ma commande'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
