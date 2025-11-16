import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Receipt, TrendingUp } from 'lucide-react';

/**
 * Page de confirmation de commande
 */
export const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, cashbackEarned } = location.state || {};

  useEffect(() => {
    // Si pas de data, rediriger
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-16 h-16 text-white" />
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Commande confirmée !
            </h1>
            <p className="text-gray-600">
              Merci pour ta commande #{order.order_number}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total payé</span>
              <span className="font-bold text-gray-900">{order.total.toFixed(2)}€</span>
            </div>
            {order.cashback_used > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cashback utilisé</span>
                <span className="font-bold text-green-600">-{order.cashback_used.toFixed(2)}€</span>
              </div>
            )}
          </div>

          {/* Cashback Earned */}
          {cashbackEarned > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-black text-green-900">Points de fidélité gagnés !</h3>
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">
                +{cashbackEarned.toFixed(2)}€
              </p>
              <p className="text-sm text-green-800">
                Tes points seront crédités dès que ta commande sera marquée comme payée
              </p>
            </motion.div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              📧 Un email de confirmation a été envoyé à {order.customer_email || 'ton adresse'}
            </p>
            <p>
              ⏱️ Temps de préparation estimé : 15-20 minutes
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-[#C62828] to-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate('/wallet')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Receipt className="w-5 h-5" />
              Voir ma carte de fidélité
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
