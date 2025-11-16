import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashbackCard } from '../../components/v3/CashbackCard';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://foodapp-redesign.preview.emergentagent.com';

/**
 * Page Wallet - Ma Carte Cashback
 */
export const WalletV3 = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cashbackSettings, setCashbackSettings] = useState({ loyalty_percentage: 5 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Charger le solde
      try {
        const balanceRes = await axios.get(`${API_URL}/api/v1/cashback/balance/${user.id}`);
        setBalance(balanceRes.data.balance || 0);
      } catch (error) {
        console.log('Balance non disponible:', error);
      }

      // Charger les settings
      try {
        const settingsRes = await axios.get(`${API_URL}/api/v1/cashback/settings`);
        setCashbackSettings(settingsRes.data);
      } catch (error) {
        console.log('Settings non disponibles:', error);
      }

      // Charger l'historique des commandes pour afficher les gains/utilisations
      try {
        const ordersRes = await axios.get(`${API_URL}/api/v1/orders/customer/${user.email}`);
        const ordersData = ordersRes.data.orders || [];
        
        // Créer l'historique des transactions
        const trans = [];
        ordersData.forEach(order => {
          if (order.cashback_used && order.cashback_used > 0) {
            trans.push({
              type: 'used',
              amount: order.cashback_used,
              order_number: order.order_number,
              date: order.created_at
            });
          }
          if (order.cashback_earned && order.cashback_earned > 0 && order.payment_status === 'paid') {
            trans.push({
              type: 'earned',
              amount: order.cashback_earned,
              order_number: order.order_number,
              date: order.updated_at || order.created_at
            });
          }
        });

        // Trier par date décroissante
        trans.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(trans.slice(0, 20));
        setOrders(ordersData);

      } catch (error) {
        console.log('Orders non disponibles:', error);
      }

    } catch (error) {
      console.error('Erreur chargement wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-gray-900">Ma Carte Cashback</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Carte Cashback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CashbackCard balance={balance} earnedToday={0} />
        </motion.div>

        {/* Info pédagogique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Comment ça marche ?</h3>
              <p className="text-blue-800 text-sm mb-2">
                Chaque fois que tu commandes chez Family's, tu gagnes <strong>{cashbackSettings.loyalty_percentage}% du montant</strong> en cashback sur ta carte.
              </p>
              <p className="text-blue-800 text-sm">
                Tu peux utiliser ta cagnotte quand tu veux sur tes prochaines commandes. 
                C'est de l'argent réel, pas des points ! 💰
              </p>
            </div>
          </div>
        </motion.div>

        {/* Historique */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">Historique</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-gray-500 font-medium">Aucune transaction</p>
              <p className="text-gray-400 text-sm mt-1">Commence par passer une commande !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={`${transaction.order_number}-${transaction.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {transaction.type === 'earned' ? 'Cashback gagné' : 'Cashback utilisé'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Commande {transaction.order_number}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className={`font-black text-lg ${
                      transaction.type === 'earned'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}
                      {transaction.amount.toFixed(2)}€
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
