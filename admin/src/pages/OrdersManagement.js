import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, DollarSign, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://family-manage-2.preview.emergentagent.com';

export const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const tabs = [
    { id: 'new', label: 'Nouvelles commandes', icon: Package, color: 'bg-red-500', status: 'pending' },
    { id: 'preparing', label: 'En cours de préparation', icon: Clock, color: 'bg-orange-500', status: 'preparing' },
    { id: 'delivering', label: 'En cours de livraison', icon: Truck, color: 'bg-blue-500', status: 'delivering' },
    { id: 'ready', label: 'Prête à être récupérée', icon: CheckCircle, color: 'bg-purple-500', status: 'ready' },
    { id: 'completed', label: 'Terminées', icon: CheckCircle, color: 'bg-green-500', status: 'completed' },
    { id: 'cancelled', label: 'Annulées', icon: XCircle, color: 'bg-gray-500', status: 'cancelled' }
  ];

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const response = await axios.get(`${API_URL}/api/v1/admin/orders?status=${currentTab.status}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handlePayment = async (orderId, paymentMethod) => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/orders/${orderId}/payment`, {
        payment_method: paymentMethod,
        payment_status: 'paid'
      });
      setShowPaymentModal(false);
      setSelectedOrder(null);
      loadOrders();
      alert('✅ Paiement enregistré!');
    } catch (error) {
      console.error('Erreur paiement:', error);
      alert('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'completed',
      'delivering': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const filteredOrders = orders.filter(o => o.status === currentTab.status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="📦 Gestion des Commandes" subtitle="Système de suivi optimisé pour tablette" />
      
      {/* Onglets */}
      <div className="p-4 bg-white border-b overflow-x-auto">
        <div className="flex space-x-3 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = orders.filter(o => o.status === tab.status).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-bold text-white transition-all transform ${
                  activeTab === tab.id 
                    ? `${tab.color} scale-105 shadow-xl` 
                    : 'bg-gray-300 hover:bg-gray-400 scale-95'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm">{tab.label}</div>
                  <div className="text-2xl font-black">{count}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-400">Aucune commande</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">#{order.id?.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-bold ${currentTab.color}`}>
                      {order.total}€
                    </div>
                  </div>

                  {/* Client */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-bold text-gray-800">{order.customer_name || 'Client'}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    )}
                  </div>

                  {/* Articles */}
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-bold text-gray-600">Articles:</p>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.notes && (
                            <p className="text-xs text-gray-500">📝 {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">x{item.quantity}</p>
                          <p className="text-sm text-gray-600">{item.total_price}€</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Type de commande */}
                  <div className="mb-4 flex items-center space-x-2 text-sm">
                    {order.order_type === 'delivery' ? (
                      <>
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">Livraison</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-600">À emporter</span>
                      </>
                    )}
                  </div>

                  {/* Paiement */}
                  <div className="mb-4">
                    {order.payment_status === 'paid' ? (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-bold text-green-700">Payé</p>
                          <p className="text-sm text-gray-600 capitalize">{order.payment_method}</p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                        }}
                        variant="outline"
                        className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Enregistrer le paiement
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {getNextStatus(order.status) && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                        className="flex-1 py-4 text-lg font-bold"
                      >
                        {getNextStatus(order.status) === 'preparing' && '▶️ Préparer'}
                        {getNextStatus(order.status) === 'ready' && '✅ Prête'}
                        {getNextStatus(order.status) === 'completed' && '🎉 Terminer'}
                      </Button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        variant="outline"
                        className="px-6 border-2 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        ❌
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Paiement */}
      {showPaymentModal && selectedOrder && (
        <Modal onClose={() => setShowPaymentModal(false)} title="💳 Enregistrer le paiement">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-4xl font-black text-gray-800">{selectedOrder.total}€</p>
              <p className="text-gray-600">Commande #{selectedOrder.id?.slice(0, 8)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handlePayment(selectedOrder.id, 'cash')}
                className="py-8 bg-green-600 hover:bg-green-700 text-xl font-bold"
              >
                <DollarSign className="w-8 h-8 mb-2" />
                Espèces
              </Button>
              <Button
                onClick={() => handlePayment(selectedOrder.id, 'card')}
                className="py-8 bg-blue-600 hover:bg-blue-700 text-xl font-bold"
              >
                <CreditCard className="w-8 h-8 mb-2" />
                Carte
              </Button>
              <Button
                onClick={() => handlePayment(selectedOrder.id, 'mobile')}
                className="py-8 bg-purple-600 hover:bg-purple-700 text-xl font-bold"
              >
                📱
                Mobile
              </Button>
              <Button
                onClick={() => handlePayment(selectedOrder.id, 'online')}
                className="py-8 bg-orange-600 hover:bg-orange-700 text-xl font-bold"
              >
                💻
                En ligne
              </Button>
            </div>

            <Button
              onClick={() => setShowPaymentModal(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Annuler
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
